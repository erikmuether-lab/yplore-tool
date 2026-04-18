import { google } from "googleapis";
import { prisma } from "@/src/lib/prisma";

function getYouTubeConfig() {
  return {
    clientId: process.env.YOUTUBE_CLIENT_ID?.trim() || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET?.trim() || "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://yplore.com",
  };
}

function getRedirectUri() {
  const { appUrl } = getYouTubeConfig();
  return `${appUrl.replace(/\/+$/, "")}/api/youtube/callback`;
}

export async function GET(request: Request) {
  const { clientId, clientSecret, appUrl } = getYouTubeConfig();

  if (!clientId || !clientSecret) {
    return Response.json(
      { error: "YOUTUBE_CLIENT_ID oder YOUTUBE_CLIENT_SECRET fehlt." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const entityId = searchParams.get("state");

  if (!code) {
    return Response.json({ error: "Code fehlt." }, { status: 400 });
  }

  if (!entityId) {
    return Response.json({ error: "entityId fehlt." }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri()
  );

  const tokenResponse = await oauth2Client.getToken(code);
  const tokens = tokenResponse.tokens;

  if (!tokens.access_token) {
    return Response.json(
      { error: "Kein access_token von Google erhalten." },
      { status: 400 }
    );
  }

  const youtubeAccount = await prisma.socialAccount.findFirst({
    where: {
      entityId,
      platform: "youtube",
    },
  });

  if (!youtubeAccount) {
    return Response.json(
      { error: "Kein YouTube-Account für diese Einheit gefunden." },
      { status: 404 }
    );
  }

  await prisma.socialAccount.update({
    where: { id: youtubeAccount.id },
    data: {
      accessToken: tokens.access_token ?? null,
      refreshToken: tokens.refresh_token ?? null,
      tokenType: tokens.token_type ?? null,
      scope: tokens.scope ?? null,
      tokenExpiresAt: tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : null,
      isActive: true,
      lastError: null,
    },
  });

  return Response.redirect(`${appUrl.replace(/\/+$/, "")}/`, 302);
}