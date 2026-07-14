import { NextResponse, type NextRequest } from "next/server";

function adminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("makesg_admin")?.value;
  const expectedToken = adminSessionToken();
  if (expectedToken && token === expectedToken) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
