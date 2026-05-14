import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolvePostAuthRedirectPath } from "@/lib/auth-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Your verification link is invalid or expired. Please log in again.")}`, request.url));
    }
  }

  const redirectPath = next?.startsWith("/") ? next : await resolvePostAuthRedirectPath(supabase);
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
