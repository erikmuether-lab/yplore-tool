import { Readable } from "stream";
import { google } from "googleapis";
import { prisma } from "@/src/lib/prisma";

type UploadToYouTubeParams = {
  postId: string;
};

export async function uploadToYouTube({
  postId,
}: UploadToYouTubeParams): Promise<{ success: boolean; error?: string }> {
  const post = await prisma.scheduledPost.findUnique({
    where: { id: postId },
    include: {
      entity: true,
      account: true,
    },
  });

  if (!post) {
    return {
      success: false,
      error: "Post nicht gefunden.",
    };
  }

  if (!post.account) {
    return {
      success: false,
      error: "Kein SocialAccount mit dem Post verknüpft.",
    };
  }

  if (!post.account.accessToken) {
    return {
      success: false,
      error: "Kein YouTube accessToken vorhanden.",
    };
  }

  const mediaUrl = String(post.publicVideoUrl ?? "").trim();

  if (!mediaUrl) {
    return {
      success: false,
      error: "Keine publicVideoUrl vorhanden.",
    };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID?.trim(),
    process.env.YOUTUBE_CLIENT_SECRET?.trim(),
    `${appUrl.replace(/\/+$/, "")}/api/youtube/callback`
  );

  oauth2Client.setCredentials({
    access_token: post.account.accessToken,
    refresh_token: post.account.refreshToken ?? undefined,
    token_type: post.account.tokenType ?? undefined,
    expiry_date: post.account.tokenExpiresAt
      ? new Date(post.account.tokenExpiresAt).getTime()
      : undefined,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const mediaResponse = await fetch(mediaUrl);

  if (!mediaResponse.ok) {
    return {
      success: false,
      error: `Video konnte nicht geladen werden: ${mediaResponse.status}`,
    };
  }

  const arrayBuffer = await mediaResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = Readable.from(buffer);

  const response = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title: post.title || "YPLORE Upload",
        description: post.caption,
      },
      status: {
        privacyStatus: "public",
      },
    },
    media: {
      mimeType: "video/mp4",
      body: stream,
    },
  });

  if (!response.data.id) {
    return {
      success: false,
      error: "YouTube hat keine Video-ID zurückgegeben.",
    };
  }

  return {
    success: true,
  };
}