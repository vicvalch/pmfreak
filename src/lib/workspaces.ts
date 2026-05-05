import { createSupabaseServerClient } from "@/lib/supabase/server";

export type WorkspaceRow = {
  id: string;
  name: string;
  type: "personal" | "pmo";
};

export async function ensurePersonalWorkspaceForUser(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_user_id", userId)
    .eq("type", "personal")
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existing?.id) return existing.id;

  const { data: created, error: createError } = await supabase
    .from("workspaces")
    .insert({ name: "Personal Workspace", type: "personal", owner_user_id: userId })
    .select("id")
    .single<{ id: string }>();

  if (createError || !created?.id) {
    throw new Error("Unable to create personal workspace.");
  }

  await supabase.from("workspace_memberships").insert({
    workspace_id: created.id,
    user_id: userId,
    role: "owner",
  });

  return created.id;
}

export async function getUserWorkspaces(userId: string): Promise<WorkspaceRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("workspace_memberships")
    .select("workspaces(id, name, type)")
    .eq("user_id", userId);

  return (data ?? []).flatMap((row) => {
    const related = row.workspaces as WorkspaceRow | WorkspaceRow[] | null;
    if (!related) return [];
    return Array.isArray(related) ? related : [related];
  });
}
