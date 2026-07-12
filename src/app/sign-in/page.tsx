import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <section className="container-shell max-w-md py-12">
      <h1 className="font-serif text-5xl font-semibold">Sign in</h1>
      <form className="mt-8 grid gap-4 border border-[#ded8cc] bg-white p-6">
        <label className="grid gap-1.5 text-sm font-medium">Email<Input type="email" name="email" placeholder="you@example.com" required /></label>
        <Button type="submit">Send magic link</Button>
        <Button type="button" variant="secondary">Continue with Google</Button>
        <p className="text-sm text-[#6d675d]">New here? <Link className="underline" href="/sign-up">Create an account</Link></p>
      </form>
    </section>
  );
}
