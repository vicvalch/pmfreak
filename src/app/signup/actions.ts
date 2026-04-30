"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export async function signupAction(formData: FormData): Promise<void> {
  if (!hasSupabaseEnv) {
    redirect("/signup?error=Configure+Supabase+environment+variables");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const role = String(formData.get("role") ?? "admin").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!fullName || !companyName || !email || !password) {
    redirect("/signup?error=Name,+company,+email,+and+password+are+required");
  }

  if (password.length < 8) {
    redirect("/signup?error=Password+must+be+at+least+8+characters");
  }

  if (!["admin", "pm", "viewer"].includes(role)) {
    redirect("/signup?error=Invalid+role+selected");
  }

  const companyId = slugify(companyName);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_id: companyId,
        company_name: companyName,
        role,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("email rate limit exceeded")) {
      redirect(
        "/signup?error=Too+many+signup+emails+were+requested.+Please+wait+a+few+minutes+before+trying+again.",
      );
    }

    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(`/signup/confirm-email?email=${encodeURIComponent(email)}`);
  }

  redirect("/onboarding");
}
