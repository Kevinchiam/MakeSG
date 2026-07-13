import type { Metadata } from "next";
import { requestSignUp } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Sign up" };

type SignUpPageProps = {
  searchParams: Promise<{
    email?: string;
    error?: string;
    sent?: string;
  }>;
};

function errorMessage(error?: string) {
  if (!error) return null;
  if (error === "invalid-form") return "Check your email and account type, then try again.";
  if (error === "auth-not-configured") return "Supabase is not configured for this deployment yet.";
  return decodeURIComponent(error);
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const message = errorMessage(params.error);

  return (
    <section className="container-shell max-w-xl py-12">
      <h1 className="font-serif text-5xl font-semibold">Create an account</h1>
      <form action={requestSignUp} className="mt-8 grid gap-4 border border-[#ded8cc] bg-white p-6">
        {params.sent ? (
          <p className="border border-[#b9d3bf] bg-[#f1f8f2] p-3 text-sm text-[#2f5d3a]">
            Check {params.email ? decodeURIComponent(params.email) : "your email"} for an account link.
          </p>
        ) : null}
        {message ? <p className="border border-[#e2b8a7] bg-[#fff6f1] p-3 text-sm text-[#8a3c24]">{message}</p> : null}
        <label className="grid gap-1.5 text-sm font-medium">Email<Input type="email" name="email" required /></label>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Account type</legend>
          <label className="flex gap-2"><input type="radio" name="accountType" value="creative" defaultChecked /> Creative</label>
          <label className="flex gap-2"><input type="radio" name="accountType" value="provider" /> Provider</label>
        </fieldset>
        <Button type="submit">Send magic link</Button>
      </form>
    </section>
  );
}
