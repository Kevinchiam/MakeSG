import { cookies } from "next/headers";
import { SiteHeaderClient } from "@/components/site/site-header-client";
import { adminAuthConfig, adminSessionCookieName } from "@/lib/admin-auth";

export async function SiteHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName)?.value;
  const expectedToken = adminAuthConfig().sessionToken;

  return <SiteHeaderClient isAdmin={Boolean(expectedToken && token === expectedToken)} />;
}
