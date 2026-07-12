import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <section className="container-shell max-w-xl py-12">
      <h1 className="font-serif text-5xl font-semibold">Create an account</h1>
      <form className="mt-8 grid gap-4 border border-[#ded8cc] bg-white p-6">
        <label className="grid gap-1.5 text-sm font-medium">Email<Input type="email" required /></label>
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
