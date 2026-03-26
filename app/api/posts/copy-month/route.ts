import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({
  adapter,
});

function getMonthMap() {
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
  } satisfies Record<string, number>;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const sourceEntityId = String(formData.get("sourceEntityId") ?? "").trim();
  const sourceMonth = String(formData.get("sourceMonth") ?? "").trim();
  const targetEntityId = String(formData.get("targetEntityId") ?? "").trim();
  const targetMonth = String(formData.get("targetMonth") ?? "").trim();

  if (!sourceEntityId || !sourceMonth || !targetEntityId || !targetMonth) {
    return Response.json(
      {
        error:
          "sourceEntityId, sourceMonth, targetEntityId und targetMonth sind erforderlich.",
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
    const month = new Date(post.scheduledAt).toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
    });

    const normalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
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

  const monthMap = getMonthMap();
  const [targetMonthName, targetYearString] = targetMonth.split(" ");
  const targetMonthIndex = monthMap[targetMonthName];
  const targetYear = Number(targetYearString);

  if (targetMonthIndex === undefined || Number.isNaN(targetYear)) {
    return Response.json({ error: "Zielmonat ist ungültig." }, { status: 400 });
  }

  for (const post of filteredSourcePosts) {
    const originalDate = new Date(post.scheduledAt);

    const newScheduledAt = new Date(
      targetYear,
      targetMonthIndex,
      originalDate.getDate(),
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
        videoFileName: post.videoFileName,
        scheduledAt: newScheduledAt,
        status: "planned",
      },
    });
  }

  return Response.redirect(new URL("/", request.url), 303);
}