import { prisma } from "@/src/lib/prisma";

function parseDateParts(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIndex) ||
    Number.isNaN(day) ||
    monthIndex < 0 ||
    monthIndex > 11 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, monthIndex, day };
}

function isSameLocalDay(date: Date, year: number, monthIndex: number, day: number) {
  return (
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day
  );
}

function getSafeTargetDate(
  targetYear: number,
  targetMonthIndex: number,
  targetDay: number,
  hours: number,
  minutes: number
) {
  const lastDayOfTargetMonth = new Date(
    targetYear,
    targetMonthIndex + 1,
    0
  ).getDate();

  if (targetDay > lastDayOfTargetMonth) {
    return null;
  }

  return new Date(
    targetYear,
    targetMonthIndex,
    targetDay,
    hours,
    minutes,
    0,
    0
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const sourceEntityId = String(formData.get("sourceEntityId") ?? "").trim();
  const sourceDate = String(formData.get("sourceDate") ?? "").trim();
  const targetEntityId = String(formData.get("targetEntityId") ?? "").trim();

  const targetDates = formData
    .getAll("targetDates")
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  if (!sourceEntityId || !sourceDate || !targetEntityId || targetDates.length === 0) {
    return Response.json(
      {
        error:
          "sourceEntityId, sourceDate, targetEntityId und mindestens ein targetDates-Wert sind erforderlich.",
      },
      { status: 400 }
    );
  }

  const sourceParts = parseDateParts(sourceDate);

  if (!sourceParts) {
    return Response.json(
      { error: "sourceDate ist ungültig." },
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

    return isSameLocalDay(
      postDate,
      sourceParts.year,
      sourceParts.monthIndex,
      sourceParts.day
    );
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

  for (const targetDate of targetDates) {
    const targetParts = parseDateParts(targetDate);

    if (!targetParts) {
      return Response.json(
        { error: `targetDate ist ungültig: ${targetDate}` },
        { status: 400 }
      );
    }

    for (const post of filteredSourcePosts) {
      const originalDate = new Date(post.scheduledAt);

      const newScheduledAt = getSafeTargetDate(
        targetParts.year,
        targetParts.monthIndex,
        targetParts.day,
        originalDate.getHours(),
        originalDate.getMinutes()
      );

      if (!newScheduledAt) {
        continue;
      }

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

  return Response.redirect(new URL("/", request.url), 303);
}