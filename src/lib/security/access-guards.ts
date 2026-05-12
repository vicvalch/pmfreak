import { getAuthUser, type AuthUserContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export class AccessDeniedError extends Error {
  constructor(message: string, public readonly metadata: Record<string, unknown> = {}) {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export async function requireWorkspaceMembership(workspaceId: string): Promise<{ user: AuthUserContext }> {
  const user = await getAuthUser();
  if (!user) {
    throw new AccessDeniedError("Unauthorized workspace access.", { workspaceId, reason: "unauthorized" });
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("workspace_memberships")
    .select("workspace_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    throw new AccessDeniedError("Workspace membership required.", { userId: user.id, workspaceId, reason: "membership_missing" });
  }

  return { user };
}

export async function requireProjectAccess(projectId: string): Promise<{ user: AuthUserContext; projectId: string }> {
  const user = await getAuthUser();
  if (!user) {
    throw new AccessDeniedError("Unauthorized project access.", { projectId, reason: "unauthorized" });
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    throw new AccessDeniedError("Project access denied.", { userId: user.id, projectId, reason: "project_not_owned" });
  }

  return { user, projectId };
}
