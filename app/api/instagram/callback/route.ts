import { prisma } from "@/src/lib/prisma";

function getInstagramConfig() {
  return {
    clientId: process.env.INSTAGRAM_CLIENT_ID?.trim() || "",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET?.trim() || "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://yplore.com",
  };
}

export async function GET(request: Request) {
  const { clientId, clientSecret, appUrl } = getInstagramConfig();

  if (!clientId || !clientSecret) {
    return Response.json(
      { error: "INSTAGRAM_CLIENT_ID oder INSTAGRAM_CLIENT_SECRET fehlt." },
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

  const redirectUri = `${appUrl.replace(/\/+$/, "")}/api/instagram/callback`;

  try {
    // 🔑 Schritt 1: Code gegen Access Token tauschen
    const tokenRes = await fetch(
      "https://graph.facebook.com/v20.0/oauth/access_token",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const tokenUrl = new URL(
      "https://graph.facebook.com/v20.0/oauth/access_token"
    );
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return Response.json(
        { error: "Token Fehler", details: tokenData },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    // 🔑 Schritt 2: Seiten abrufen
    const pagesRes = await fetch(
      `https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}`
    );

    const pagesData = await pagesRes.json();

    if (!pagesData?.data?.length) {
      return Response.json(
        { error: "Keine Facebook Pages gefunden." },
        { status: 400 }
      );
    }

    // 👉 Nimm erste Page (für MVP)
    const page = pagesData.data[0];

    // 🔑 Schritt 3: Instagram Account holen
    const igRes = await fetch(
      `https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`
    );

    const igData = await igRes.json();

    const igId = igData?.instagram_business_account?.id;

    if (!igId) {
      return Response.json(
        { error: "Kein Instagram Business Account gefunden." },
        { status: 400 }
      );
    }

    // 🔑 Schritt 4: Account speichern
    await prisma.socialAccount.create({
      data: {
        entityId,
        platform: "instagram",
        handle: `ig_${igId}`,
        externalAccountId: igId,
        accessToken,
        platformUserId: igId,
        isActive: true,
      },
    });

    return Response.redirect(
      `${appUrl}/?success=instagram_connected`,
      302
    );
  } catch (error) {
    return Response.json(
      {
        error: "Instagram Callback Fehler",
        message: error instanceof Error ? error.message : "Unbekannt",
      },
      { status: 500 }
    );
  }
}