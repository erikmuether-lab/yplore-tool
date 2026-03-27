import { prisma } from "@/src/lib/prisma";

function getApiConfig() {
  return {
    zernioApiUrl: process.env.ZERNIO_API_URL?.trim() || "",
    cronSecret: process.env.CRON_SECRET?.trim() || "",
  };
}

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const cronHeader = request.headers.get("x-cron-secret") ?? "";
  const { cronSecret } = getApiConfig();

  if (!cronSecret) return false;

  return (
    authHeader === `Bearer ${cronSecret}` ||
    cronHeader === cronSecret
  );
}

function isPublicVideoUrl(videoUrl: string) {
  return /^https?:\/\//i.test(videoUrl);
}

async function sendPostNow(postId: string) {
  const post = await prisma.scheduledPost.findUnique({
    where: { id: postId },
    include: {
      entity: true,
      account: true,
    },
  });

  if (!post) {
    return { success: false, error: "Post nicht gefunden." };
  }

  const zernioApiUrl = process.env.ZERNIO_API_URL?.trim() || "";

  if (!zernioApiUrl) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    return { success: false, error: "ZERNIO_API_URL fehlt." };
  }

  if (!post.entity?.apiKey?.trim()) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    return { success: false, error: "API-Key fehlt." };
  }

  if (!post.account?.externalAccountId) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    return { success: false, error: "externalAccountId fehlt." };
  }

  const mediaUrl = String(post.publicVideoUrl ?? "").trim();

  if (!mediaUrl || !isPublicVideoUrl(mediaUrl)) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    return { success: false, error: "publicVideoUrl fehlt oder ist ungültig." };
  }

  await prisma.scheduledPost.update({
    where: { id: postId },
    data: { status: "sending" },
  });

  try {
    const payload = {
      content: post.caption,
      publishNow: true,
      platforms: [
        {
          platform: post.platform,
          accountId: post.account.externalAccountId,
        },
      ],
      mediaItems: [
        {
          type: "video",
          url: mediaUrl,
        },
      ],
    };

    const response = await fetch(`${zernioApiUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${post.entity.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text().catch(() => "");

    if (!response.ok) {
      await prisma.scheduledPost.update({
        where: { id: postId },
        data: { status: "failed" },
      });

      return {
        success: false,
        error: `Zernio-Fehler: ${response.status} ${responseText}`.trim(),
      };
    }

    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "sent" },
    });

    return { success: true };
  } catch (error) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const duePosts = await prisma.scheduledPost.findMany({
    where: {
      status: "planned",
      scheduledAt: {
        lte: now,
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
    include: {
      entity: true,
      account: true,
    },
    take: 50,
  });

  const results: Array<{
    id: string;
    platform: string;
    scheduledAt: Date;
    success: boolean;
    error?: string;
  }> = [];

  for (const post of duePosts) {
    const result = await sendPostNow(post.id);

    results.push({
      id: post.id,
      platform: post.platform,
      scheduledAt: post.scheduledAt,
      success: result.success,
      error: result.success ? undefined : result.error,
    });
  }

  return Response.json({
    success: true,
    processedCount: results.length,
    results,
  });
}