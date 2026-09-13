import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuthConfig, adminSessionCookieNames } from "@/lib/admin-auth";

export async function requireAdminSession(next = "/admin") {
  const cookieStore = await cookies();
  const expectedToken = adminAuthConfig().sessionToken;
  const hasValidToken = adminSessionCookieNames.some((cookieName) => cookieStore.get(cookieName)?.value === expectedToken);

  if (!expectedToken || !hasValidToken) {
    redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  }
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const expectedToken = adminAuthConfig().sessionToken;
  if (!expectedToken) return false;
  return adminSessionCookieNames.some((cookieName) => cookieStore.get(cookieName)?.value === expectedToken);
}
