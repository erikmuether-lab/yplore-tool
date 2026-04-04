import { prisma } from "@/src/lib/prisma";

function parseYear(value: string) {
  const year = Number(String(value ?? "").trim());

  if (Number.isNaN(year) || year < 2000 || year > 2100) {
    return null;
  }

  return year;
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

  const year = Number(parts.find((part) => part.type === "year")?.value ?? "1970");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "01");
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "01");
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "00");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "00");

  return {
    year,
    monthIndex: month - 1,
    day,
    hour,
    minute,
  };
}

function isSameLocalYear(date: Date, year: number) {
  const parts = getBerlinDateParts(date);
  return parts.year === year;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const sourceEntityId = String(formData.get("sourceEntityId") ?? "").trim();
  const sourceYearValue = String(formData.get("sourceYear") ?? "").trim();
  const sourceYear = parseYear(sourceYearValue);
  const targetEntityId = String(formData.get("targetEntityId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "").trim();

  const targetYears = formData
    .getAll("targetYears")
    .map((value) => parseYear(String(value ?? "").trim()))
    .filter((value): value is number => value !== null);

  if (!sourceEntityId || !sourceYear || !targetEntityId || targetYears.length === 0) {
    return Response.json(
      {
        error:
          "sourceEntityId, sourceYear, targetEntityId und mindestens ein targetYears-Wert sind erforderlich.",
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
    const postDate = new Date(post.scheduledAt);
    return isSameLocalYear(postDate, sourceYear);
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

  for (const targetYear of targetYears) {
    for (const post of filteredSourcePosts) {
      const originalParts = getBerlinDateParts(post.scheduledAt);
      const maxTargetDay = getDaysInMonth(targetYear, originalParts.monthIndex);

      if (originalParts.day > maxTargetDay) {
        continue;
      }

      const newScheduledAt = new Date(
        Date.UTC(
          targetYear,
          originalParts.monthIndex,
          originalParts.day,
          originalParts.hour - 1,
          originalParts.minute,
          0,
          0
        )
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