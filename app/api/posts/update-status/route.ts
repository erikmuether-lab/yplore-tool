import { PrismaClient } from "@/src/generated/prisma/client";

const prisma = new PrismaClient();

function getApiConfig() {
  return {
    zernioApiUrl: process.env.ZERNIO_API_URL?.trim() || "",
  };
}

function canSendToExternalApis() {
  const { zernioApiUrl } = getApiConfig();
  return Boolean(zernioApiUrl);
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
    return { error: "Post nicht gefunden.", status: 404 };
  }

  if (!canSendToExternalApis()) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    return { error: "ZERNIO_API_URL fehlt.", status: 500 };
  }

  if (!post.entity?.apiKey?.trim()) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    return { error: "Für diese Einheit fehlt der API-Key.", status: 400 };
  }

  if (!post.account?.externalAccountId) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    return { error: "Für diesen Post fehlt die Zernio externalAccountId.", status: 400 };
  }

  const mediaUrl = String(post.publicVideoUrl ?? "").trim();

  if (!mediaUrl) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    return { error: "Für diesen Post fehlt eine öffentliche Video-URL.", status: 400 };
  }

  if (!isPublicVideoUrl(mediaUrl)) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    return { error: "Die publicVideoUrl ist nicht öffentlich erreichbar.", status: 400 };
  }

  await prisma.scheduledPost.update({
    where: { id: postId },
    data: { status: "sending" },
  });

  const { zernioApiUrl } = getApiConfig();

  try {
    const payload = {
      content: post.caption,
      publishNow: true,
      platforms: [
  {
          platform: post.platform,
          accountId: post.account?.externalAccountId,
        },
      ],
      mediaItems: [
        {
          type: "video",
          url: mediaUrl,
        },
      ],
    };

    console.log("ZERNIO SEND PAYLOAD:", JSON.stringify(payload, null, 2));

    const response = await fetch(`${zernioApiUrl}/posts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${post.entity.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text().catch(() => "");

    console.log("ZERNIO STATUS:", response.status);
    console.log("ZERNIO RESPONSE:", responseText);

    if (!response.ok) {
      await prisma.scheduledPost.update({
        where: { id: postId },
        data: { status: "failed" },
      });

      return {
        error: `Zernio-Fehler: ${response.status} ${responseText}`.trim(),
        status: 502,
      };
    }

    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "sent" },
    });

    return { success: true, status: 200 };
  } catch (error) {
    console.error("ZERNIO FETCH ERROR:", error);

    await prisma.scheduledPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });

    return {
      error:
        error instanceof Error
          ? error.message
          : "Unbekannter Fehler beim Senden an Zernio.",
      status: 500,
    };
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id || !status) {
    return Response.json(
      { error: "Post-ID oder Status fehlt." },
      { status: 400 }
    );
  }

  if (status === "send-now") {
    await sendPostNow(id);
    return Response.redirect(new URL("/", request.url), 303);
  }

  await prisma.scheduledPost.update({
    where: { id },
    data: { status },
  });

  return Response.redirect(new URL("/", request.url), 303);
}