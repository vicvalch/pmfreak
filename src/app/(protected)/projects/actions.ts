"use server";

import { redirect } from "next/navigation";
import { requireAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createProjectAction(formData: FormData) {
  const user = await requireAuthUser();
  const supabase = await createSupabaseServerClient();

  const name = String(formData.get("name") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw.length > 0 ? descriptionRaw : null;

  if (!name) {
    redirect("/projects?error=Project+name+is+required");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name, description })
    .select("id")
    .single<{ id: string }>();

  if (error || !data?.id) {
    redirect(`/projects?error=${encodeURIComponent(error?.message ?? "Unable to create project")}`);
  }

  redirect(`/projects/${data.id}`);
}
