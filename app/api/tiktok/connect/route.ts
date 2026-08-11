import { randomBytes } from "crypto";

function getTikTokConfig() {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY?.trim() || "",
    redirectUri:
      process.env.TIKTOK_REDIRECT_URI?.trim() ||
      "https://yplore.com/api/tiktok/callback",
  };
}

export async function GET(request: Request) {
  const { clientKey, redirectUri } = getTikTokConfig();

  if (!clientKey) {
    return Response.json(
      { error: "TIKTOK_CLIENT_KEY fehlt." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get("entityId");

  if (!entityId) {
    return Response.json({ error: "entityId fehlt." }, { status: 400 });
  }

  const csrfState = randomBytes(16).toString("hex");
  const state = `${entityId}:${csrfState}`;

  const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
  authUrl.searchParams.set("client_key", clientKey);
  authUrl.searchParams.set(
  "scope",
  "user.info.basic,video.upload,video.publish"
);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);

  return Response.redirect(authUrl.toString(), 302);
}