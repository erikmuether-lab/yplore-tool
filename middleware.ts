import { NextRequest, NextResponse } from "next/server";

const USERNAME = process.env.BASIC_AUTH_USER || "";
const PASSWORD = process.env.BASIC_AUTH_PASSWORD || "";

function unauthorizedResponse() {
  return new NextResponse("Auth required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="YPLORE"',
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/uploads/r2-presign")
  ) {
    return NextResponse.next();
  }

  if (!USERNAME || !PASSWORD) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const base64Credentials = authHeader.split(" ")[1] || "";
  const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
  const [username, password] = decoded.split(":");

  if (username !== USERNAME || password !== PASSWORD) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};