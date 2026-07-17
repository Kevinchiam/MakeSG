"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function adminUsername() {
  return process.env.ADMIN_USERNAME ?? "Admin";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? "MakeSG";
}

function adminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN;
}

const adminSessionMaxAge = 60 * 60 * 24 * 365;

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (username !== adminUsername() || password !== adminPassword()) {
    redirect(`/admin/login?error=invalid&next=${encodeURIComponent(next)}`);
  }

  const sessionToken = adminSessionToken();
  if (!sessionToken) {
    redirect(`/admin/login?error=not-configured&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set("makesg_admin", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAge,
    expires: new Date(Date.now() + adminSessionMaxAge * 1000),
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}
