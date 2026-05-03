function getInstagramConfig() {
  return {
    clientId: process.env.INSTAGRAM_CLIENT_ID?.trim() || "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://yplore.com",
  };
}

export async function GET(request: Request) {
  const { clientId, appUrl } = getInstagramConfig();

  if (!clientId) {
    return Response.json(
      { error: "INSTAGRAM_CLIENT_ID fehlt." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get("entityId");

  if (!entityId) {
    return Response.json({ error: "entityId fehlt." }, { status: 400 });
  }

  const redirectUri = `${appUrl.replace(/\/+$/, "")}/api/instagram/callback`;

  const authUrl = new URL("https://www.facebook.com/v20.0/dialog/oauth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", entityId);
  authUrl.searchParams.set(
    "scope",
    [
      "pages_show_list",
      "pages_read_engagement",
      "instagram_basic",
      "instagram_content_publish",
    ].join(",")
  );

  return Response.redirect(authUrl.toString(), 302);
}