import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuthConfig, adminSessionCookieName } from "@/lib/admin-auth";

export async function requireAdminSession(next = "/admin") {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName)?.value;
  const expectedToken = adminAuthConfig().sessionToken;

  if (!expectedToken || token !== expectedToken) {
    redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  }
}
