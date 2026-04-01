import { prisma } from "@/src/lib/prisma";

function parseYear(value: string) {
  const year = Number(String(value ?? "").trim());

  if (Number.isNaN(year) || year < 2000 || year > 2100) {
    return null;
  }

  return year;
}

function isSameLocalYear(date: Date, year: number) {
  return date.getFullYear() === year;
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
      const originalDate = new Date(post.scheduledAt);
      const originalMonthIndex = originalDate.getMonth();
      const originalDay = originalDate.getDate();
      const maxTargetDay = getDaysInMonth(targetYear, originalMonthIndex);

      if (originalDay > maxTargetDay) {
        continue;
      }

      const newScheduledAt = new Date(
        targetYear,
        originalMonthIndex,
        originalDay,
        originalDate.getHours(),
        originalDate.getMinutes(),
        0,
        0
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

  return Response.redirect(new URL("/", request.url), 303);
}