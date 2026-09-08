import { cookies } from "next/headers";
import { SiteHeaderClient } from "@/components/site/site-header-client";
import { adminAuthConfig, adminSessionCookieNames } from "@/lib/admin-auth";

export async function SiteHeader() {
  const cookieStore = await cookies();
  const expectedToken = adminAuthConfig().sessionToken;
  const hasValidToken = adminSessionCookieNames.some((cookieName) => cookieStore.get(cookieName)?.value === expectedToken);

  return <SiteHeaderClient isAdmin={Boolean(expectedToken && hasValidToken)} />;
}
