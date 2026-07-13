"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation";

const signUpSchema = signInSchema.extend({
  accountType: z.enum(["creative", "provider"]),
});

function appUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function encoded(value: string) {
  return encodeURIComponent(value);
}

export async function requestSignIn(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect("/sign-in?error=invalid-email");
  }

  const supabase = await getConfiguredSupabase("/sign-in");
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${appUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    redirect(`/sign-in?error=${encoded(error.message)}`);
  }

  redirect(`/sign-in?sent=1&email=${encoded(parsed.data.email)}`);
}

export async function requestSignUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    accountType: formData.get("accountType"),
  });

  if (!parsed.success) {
    redirect("/sign-up?error=invalid-form");
  }

  const supabase = await getConfiguredSupabase("/sign-up");
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${appUrl()}/auth/callback?next=/dashboard`,
      data: {
        account_type: parsed.data.accountType,
      },
    },
  });

  if (error) {
    redirect(`/sign-up?error=${encoded(error.message)}`);
  }

  redirect(`/sign-up?sent=1&email=${encoded(parsed.data.email)}`);
}

async function getConfiguredSupabase(errorPath: "/sign-in" | "/sign-up") {
  try {
    return await createClient();
  } catch {
    if (errorPath === "/sign-up") {
      redirect("/sign-up?error=auth-not-configured");
    }
    redirect("/sign-in?error=auth-not-configured");
  }
}
