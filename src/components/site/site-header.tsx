import { cookies } from "next/headers";
import { SiteHeaderClient } from "@/components/site/site-header-client";

function adminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN;
}

export async function SiteHeader() {
  const cookieStore = await cookies();
  const token = cookieStore.get("makesg_admin")?.value;
  const expectedToken = adminSessionToken();

  return <SiteHeaderClient isAdmin={Boolean(expectedToken && token === expectedToken)} />;
}
