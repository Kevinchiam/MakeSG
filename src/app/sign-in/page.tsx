import type { Metadata } from "next";
import Link from "next/link";
import { requestSignIn } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Sign in" };

type SignInPageProps = {
  searchParams: Promise<{
    email?: string;
    error?: string;
    sent?: string;
  }>;
};

function errorMessage(error?: string) {
  if (!error) return null;
  if (error === "invalid-email") return "Enter a valid email address.";
  if (error === "auth-not-configured") return "Supabase is not configured for this deployment yet.";
  return decodeURIComponent(error);
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const message = errorMessage(params.error);

  return (
    <section className="container-shell max-w-md py-12">
      <h1 className="font-serif text-5xl font-semibold">Sign in</h1>
      <form action={requestSignIn} className="mt-8 grid gap-4 border border-[#ded8cc] bg-white p-6">
        {params.sent ? (
          <p className="border border-[#b9d3bf] bg-[#f1f8f2] p-3 text-sm text-[#2f5d3a]">
            Check {params.email ? decodeURIComponent(params.email) : "your email"} for a sign-in link.
          </p>
        ) : null}
        {message ? <p className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm text-[#8a3c24]">{message}</p> : null}
        <label className="grid gap-1.5 text-sm font-medium">Email<Input type="email" name="email" placeholder="you@example.com" required /></label>
        <Button type="submit">Send magic link</Button>
        <p className="text-sm text-[#6d675d]">New here? <Link className="underline" href="/sign-up">Create an account</Link></p>
      </form>
    </section>
  );
}
