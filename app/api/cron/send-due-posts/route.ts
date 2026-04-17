import { prisma } from "@/src/lib/prisma";
import { uploadToYouTube } from "@/src/lib/youtube";

type SendResult = {
  success: boolean;
  error?: string;
};

function getApiConfig() {
  return {
    cronSecret: process.env.CRON_SECRET?.trim() || "",
  };
}

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const cronHeader = request.headers.get("x-cron-secret") ?? "";
  const { cronSecret } = getApiConfig();

  if (!cronSecret) return false;

  return authHeader === `Bearer ${cronSecret}` || cronHeader === cronSecret;
}

function isPublicVideoUrl(videoUrl: string) {
  return /^https?:\/\//i.test(videoUrl);
}

async function sendToYoutube(postId: string): Promise<SendResult> {
  return uploadToYouTube({ postId });
}

async function sendToInstagram(): Promise<SendResult> {
  return {
    success: false,
    error: "Instagram Publisher noch nicht eingerichtet.",
  };
}

async function sendToTikTok(): Promise<SendResult> {
  return {
    success: false,
    error: "TikTok Publisher noch nicht eingerichtet.",
  };
}

async function sendViaPlatform(post: {
  id: string;
  platform: string;
}): Promise<SendResult> {
  if (post.platform === "youtube") {
    return sendToYoutube(post.id);
  }

  if (post.platform === "instagram") {
    return sendToInstagram();
  }

  if (post.platform === "tiktok") {
    return sendToTikTok();
  }

  return {
    success: false,
    error: `Unbekannte Plattform: ${post.platform}`,
  };
}

async function sendPostNow(postId: string): Promise<SendResult> {
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

  const mediaUrl = String(post.publicVideoUrl ?? "").trim();

  if (!mediaUrl || !isPublicVideoUrl(mediaUrl)) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });

    return {
      success: false,
      error: "publicVideoUrl fehlt oder ist ungültig.",
    };
  }

  await prisma.scheduledPost.update({
    where: { id: postId },
    data: { status: "sending" },
  });

  try {
    const result = await sendViaPlatform(post);

    await prisma.scheduledPost.update({
      where: { id: postId },
      data: {
        status: result.success ? "sent" : "failed",
      },
    });

    return result;
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