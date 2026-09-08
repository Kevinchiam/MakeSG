import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminEntryCookieName, adminSessionCookieName, legacyAdminSessionCookieName } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  for (const cookieName of [adminSessionCookieName, adminEntryCookieName, legacyAdminSessionCookieName]) {
    cookieStore.set(cookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
