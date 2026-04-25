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

export const signupAction = async (formData: FormData): Promise<void> => {
  if (!hasSupabaseEnv) {
    redirect("/signup?error=Configure+Supabase+environment+variables");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const role = String(formData.get("role") ?? "viewer").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!fullName || !companyName || !email || !password) {
    redirect("/signup?error=Name,+company,+email,+and+password+are+required");
  }

  if (!["admin", "pm", "viewer"].includes(role)) {
    redirect("/signup?error=Invalid+role+selected");
  }

  const companyId = slugify(companyName);
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signUp({
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
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
};
