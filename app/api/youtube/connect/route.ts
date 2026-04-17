import { google } from "googleapis";

function getYouTubeConfig() {
  return {
    clientId: process.env.YOUTUBE_CLIENT_ID?.trim() || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET?.trim() || "",
    appUrl:
      process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
  };
}

function getRedirectUri() {
  const { appUrl } = getYouTubeConfig();
  return `${appUrl.replace(/\/+$/, "")}/api/youtube/callback`;
}

export async function GET(request: Request) {
  const { clientId, clientSecret } = getYouTubeConfig();

  if (!clientId || !clientSecret) {
    return Response.json(
      { error: "YOUTUBE_CLIENT_ID oder YOUTUBE_CLIENT_SECRET fehlt." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get("entityId");

  if (!entityId) {
    return Response.json({ error: "entityId fehlt." }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    getRedirectUri()
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    state: entityId,
    scope: [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.readonly",
    ],
  });

  return Response.redirect(authUrl, 302);
}