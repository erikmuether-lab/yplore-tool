import { prisma } from "@/src/lib/prisma";

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
  return {
    success: false,
    error: "YouTube Publisher noch nicht eingerichtet.",
  };
}

async function sendToInstagram(): Promise<SendResult> {
  return {
    success: false,
    error: "Instagram Publisher noch nicht eingerichtet.",
  };
}

async function sendToTikTok(post: {
  account?: {
    accessToken?: string | null;
  } | null;
  caption: string;
  publicVideoUrl?: string | null;
}): Promise<SendResult> {
  if (!post.account?.accessToken) {
    return {
      success: false,
      error: "Kein TikTok Access Token vorhanden.",
    };
  }

  const videoUrl = String(post.publicVideoUrl ?? "").trim();

  if (!videoUrl || !isPublicVideoUrl(videoUrl)) {
    return {
      success: false,
      error: "Video URL fehlt oder ungültig.",
    };
  }

  try {
    const response = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${post.account.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: {
            title: post.caption || "",
            privacy_level: "PUBLIC",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: videoUrl,
          },
        }),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: `TikTok Fehler: ${JSON.stringify(data)}`,
      };
    }

    const publishId = data?.data?.publish_id;

    if (!publishId) {
      return {
        success: false,
        error: "Kein publish_id erhalten.",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unbekannter TikTok Fehler",
    };
  }
}

async function sendViaPlatform(post: {
  id: string;
  platform: string;
  caption: string;
  publicVideoUrl?: string | null;
  account?: {
    accessToken?: string | null;
  } | null;
}): Promise<SendResult> {
  if (post.platform === "youtube") {
    return sendToYoutube(post.id);
  }

  if (post.platform === "instagram") {
    return sendToInstagram();
  }

  if (post.platform === "tiktok") {
    return sendToTikTok(post);
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

  await prisma.scheduledPost.update({
    where: { id: postId },
    data: { status: "sending" },
  });

  const result = await sendViaPlatform({
    id: post.id,
    platform: post.platform,
    caption: post.caption,
    publicVideoUrl: post.publicVideoUrl,
    account: post.account,
  });

  await prisma.scheduledPost.update({
    where: { id: postId },
    data: {
      status: result.success ? "sent" : "failed",
    },
  });

  return result;
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