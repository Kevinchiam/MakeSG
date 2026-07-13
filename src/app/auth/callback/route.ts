import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing-auth-code", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        account_type: user.user_metadata.account_type === "provider" ? "provider" : "creative",
        display_name: user.email?.split("@")[0] ?? null,
      },
      { onConflict: "user_id" },
    );
  }

  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/dashboard", requestUrl.origin));
}
