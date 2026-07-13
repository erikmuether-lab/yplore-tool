export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return Response.json(
      { error: `TikTok OAuth Fehler: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return Response.json(
      { error: "Kein Authorization Code erhalten." },
      { status: 400 }
    );
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  const redirectUri =
    process.env.TIKTOK_REDIRECT_URI?.trim() ||
    "https://yplore.com/api/tiktok/callback";

  if (!clientKey || !clientSecret) {
    return Response.json(
      { error: "TikTok Client Key oder Client Secret fehlt." },
      { status: 500 }
    );
  }

  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch(
    "https://open.tiktokapis.com/v2/oauth/token/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    return Response.json(
      {
        error: "TikTok Token-Austausch fehlgeschlagen.",
        details: data,
      },
      { status: 400 }
    );
  }

  return Response.json({
    success: true,
    message: "TikTok Token erfolgreich erhalten.",
    openId: data.open_id,
    scope: data.scope,
    expiresIn: data.expires_in,
    refreshExpiresIn: data.refresh_expires_in,
  });
}