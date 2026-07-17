import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginAdmin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Admin login" };

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("makesg_admin")?.value;
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  if (expectedToken && token === expectedToken) {
    const next = params.next?.startsWith("/admin") && params.next !== "/admin/login" ? params.next : "/admin";
    redirect(next);
  }

  const errorMessage = params.error === "not-configured"
    ? "Admin login is not configured. Add ADMIN_SESSION_TOKEN in Vercel."
    : "Check the admin username and password.";

  return (
    <section className="container-shell max-w-md py-12">
      <h1 className="font-serif text-5xl font-semibold">Admin login</h1>
      <form action={loginAdmin} className="mt-8 grid gap-4 border border-[#ded8cc] bg-white p-6">
        <input type="hidden" name="next" value={params.next ?? "/admin"} />
        {params.error ? (
          <p className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm text-[#8a3c24]" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <label className="grid gap-1.5 text-sm font-medium">
          Username
          <Input name="username" autoComplete="username" required />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Password
          <Input name="password" type="password" autoComplete="current-password" required />
        </label>
        <Button type="submit">Log in</Button>
      </form>
    </section>
  );
}
