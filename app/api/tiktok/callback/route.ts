import { prisma } from "@/src/lib/prisma";

type TikTokTokenResponse = {
  access_token?: string;
  expires_in?: number;
  open_id?: string;
  refresh_expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type TikTokUserResponse = {
  data?: {
    user?: {
      open_id?: string;
      display_name?: string;
      avatar_url?: string;
    };
  };
  error?: {
    code?: string;
    message?: string;
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const entityId = state?.split(":")[0];

  if (oauthError) {
    return Response.json(
      { error: `TikTok OAuth Fehler: ${oauthError}` },
      { status: 400 }
    );
  }

  if (!code) {
    return Response.json(
      { error: "Kein Authorization Code erhalten." },
      { status: 400 }
    );
  }

  if (!entityId) {
    return Response.json(
      { error: "Entity-ID fehlt im OAuth-State." },
      { status: 400 }
    );
  }

  const entity = await prisma.entity.findUnique({
    where: { id: entityId },
  });

  if (!entity) {
    return Response.json(
      { error: "Die zugehörige Einheit wurde nicht gefunden." },
      { status: 404 }
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

  try {
    // 1. Authorization Code gegen Tokens tauschen
    const tokenBody = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenBody,
        cache: "no-store",
      }
    );

    const tokenData =
      (await tokenResponse.json()) as TikTokTokenResponse;

console.log("TOKEN RESPONSE:", JSON.stringify(tokenData, null, 2));

    if (
      !tokenResponse.ok ||
      !tokenData.access_token ||
      !tokenData.open_id
    ) {
      return Response.json(
        {
          error: "TikTok Token-Austausch fehlgeschlagen.",
          details:
            tokenData.error_description ||
            tokenData.error ||
            "Unbekannter TikTok-Fehler",
        },
        { status: 400 }
      );
    }

    // 2. TikTok-Profil abrufen
    const userInfoUrl = new URL(
      "https://open.tiktokapis.com/v2/user/info/"
    );

    userInfoUrl.searchParams.set(
      "fields",
      "open_id,display_name,avatar_url"
    );

    const userResponse = await fetch(userInfoUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      cache: "no-store",
    });

    const userData =
      (await userResponse.json()) as TikTokUserResponse;

    const displayName =
      userData.data?.user?.display_name?.trim() ||
      `TikTok ${tokenData.open_id.slice(-6)}`;

    const tokenExpiresAt = new Date(
      Date.now() + (tokenData.expires_in ?? 86400) * 1000
    );

    // 3. Bestehenden TikTok-Account der Einheit suchen
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        entityId,
        platform: "tiktok",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const accountData = {
      handle: displayName,
      externalAccountId: tokenData.open_id,
      platformUserId: tokenData.open_id,
      username: displayName,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? null,
      tokenType: tokenData.token_type ?? "Bearer",
      tokenExpiresAt,
      scope: tokenData.scope ?? null,
      isActive: true,
      lastError: null,
    };

    // 4. TikTok-Account speichern oder aktualisieren
    if (existingAccount) {
      await prisma.socialAccount.update({
        where: { id: existingAccount.id },
        data: accountData,
      });
    } else {
      await prisma.socialAccount.create({
        data: {
          entityId,
          platform: "tiktok",
          ...accountData,
        },
      });
    }

    // 5. Zurück zur YPLORE-Startseite
    return Response.redirect(
      new URL("/?tiktok=connected", request.url),
      302
    );
  } catch (error) {
    console.error("TikTok Callback Fehler:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unbekannter TikTok-Callback-Fehler",
      },
      { status: 500 }
    );
  }
}