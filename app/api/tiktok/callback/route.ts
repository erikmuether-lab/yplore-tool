export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return new Response(`TikTok Error: ${error}`, { status: 400 });
  }

  if (!code) {
    return new Response("Kein Authorization Code erhalten.", {
      status: 400,
    });
  }

  return new Response(
    `
      <html>
        <body style="font-family: Arial; padding:40px;">
          <h1>TikTok erfolgreich verbunden ✅</h1>
          <p>Code erhalten:</p>
          <pre>${code}</pre>
          <p>State:</p>
          <pre>${state}</pre>
        </body>
      </html>
    `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
}