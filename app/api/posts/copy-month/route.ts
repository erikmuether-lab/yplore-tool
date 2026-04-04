import { prisma } from "@/src/lib/prisma";

function getMonthMap(): Record<string, number> {
  return {
    Januar: 0,
    Februar: 1,
    März: 2,
    April: 3,
    Mai: 4,
    Juni: 5,
    Juli: 6,
    August: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Dezember: 11,
  };
}

function parseMonthLabel(value: string) {
  const [monthName, yearString] = value.trim().split(" ");
  const monthMap = getMonthMap();
  const monthIndex = monthMap[monthName];
  const year = Number(yearString);

  if (monthIndex === undefined || Number.isNaN(year)) {
    return null;
  }

  return { monthIndex, year };
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getBerlinDateParts(dateInput: string | Date) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? "1970"),
    monthIndex:
      Number(parts.find((part) => part.type === "month")?.value ?? "01") - 1,
    day: Number(parts.find((part) => part.type === "day")?.value ?? "01"),
    hour: Number(parts.find((part) => part.type === "hour")?.value ?? "00"),
    minute: Number(parts.find((part) => part.type === "minute")?.value ?? "00"),
  };
}

function normalizeMonthLabelFromBerlin(dateInput: string | Date) {
  const parts = getBerlinDateParts(dateInput);
  return `${Object.keys(getMonthMap())[parts.monthIndex]} ${parts.year}`;
}

function getBerlinOffsetMinutes(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    timeZoneName: "shortOffset",
    year: "numeric",
  }).formatToParts(date);

  const offsetText =
    parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+0";

  const match = offsetText.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);

  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] ?? "0");
  const minutes = Number(match[3] ?? "0");

  return sign * (hours * 60 + minutes);
}

function createBerlinDate(
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
  minute: number
) {
  let result = new Date(Date.UTC(year, monthIndex, day, hour, minute, 0, 0));

  for (let i = 0; i < 3; i += 1) {
    const offsetMinutes = getBerlinOffsetMinutes(result);
    result = new Date(
      Date.UTC(year, monthIndex, day, hour, minute, 0, 0) -
        offsetMinutes * 60_000
    );
  }

  return result;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const sourceEntityId = String(formData.get("sourceEntityId") ?? "").trim();
  const sourceMonth = String(formData.get("sourceMonth") ?? "").trim();
  const targetEntityId = String(formData.get("targetEntityId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  const targetMonths = formData
    .getAll("targetMonths")
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  if (!sourceEntityId || !sourceMonth || !targetEntityId || targetMonths.length === 0) {
    return Response.json(
      {
        error:
          "sourceEntityId, sourceMonth, targetEntityId und mindestens ein targetMonths-Wert sind erforderlich.",
      },
      { status: 400 }
    );
  }

  const sourcePosts = await prisma.scheduledPost.findMany({
    where: {
      entityId: sourceEntityId,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });

  const filteredSourcePosts = sourcePosts.filter((post) => {
    const normalizedMonth = normalizeMonthLabelFromBerlin(post.scheduledAt);
    return normalizedMonth === sourceMonth;
  });

  const targetEntity = await prisma.entity.findUnique({
    where: { id: targetEntityId },
    include: { accounts: true },
  });

  if (!targetEntity) {
    return Response.json(
      { error: "Ziel-Einheit nicht gefunden." },
      { status: 404 }
    );
  }

  for (const targetMonth of targetMonths) {
    const parsedTarget = parseMonthLabel(targetMonth);

    if (!parsedTarget) {
      return Response.json(
        { error: `Zielmonat ist ungültig: ${targetMonth}` },
        { status: 400 }
      );
    }

    const maxTargetDay = getDaysInMonth(parsedTarget.year, parsedTarget.monthIndex);

    for (const post of filteredSourcePosts) {
      const originalParts = getBerlinDateParts(post.scheduledAt);

      if (originalParts.day > maxTargetDay) {
        continue;
      }

      const newScheduledAt = createBerlinDate(
        parsedTarget.year,
        parsedTarget.monthIndex,
        originalParts.day,
        originalParts.hour,
        originalParts.minute
      );

      const targetAccount =
        targetEntity.accounts.find((a) => a.platform === post.platform) ?? null;

      await prisma.scheduledPost.create({
        data: {
          entityId: targetEntityId,
          accountId: targetAccount?.id ?? null,
          platform: post.platform,
          title: post.title,
          caption: post.caption,
          videoUrl: post.videoUrl,
          publicVideoUrl: post.publicVideoUrl,
          videoFileName: post.videoFileName,
          scheduledAt: newScheduledAt,
          status: "planned",
        },
      });
    }
  }

  const redirectUrl = returnTo
    ? new URL(returnTo, request.url)
    : new URL("/", request.url);

  return Response.redirect(redirectUrl, 303);
}