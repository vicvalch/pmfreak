import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { resolvePostAuthRedirectPath } from "@/lib/auth-redirect";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=Email+and+password+are+required", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const isUnverified = error.message.toLowerCase().includes("email not confirmed");
    const message = isUnverified ? "Please verify your email before logging in." : error.message;
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  }

  const redirectPath = await resolvePostAuthRedirectPath(supabase);
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
