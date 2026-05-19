import type { AuthUserContext } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { resolveBootstrapRuntimeContext } from "@/lib/runtime/bootstrap/runtime";

export type WorkspaceRow = {
  id: string;
  name: string;
};

export type WorkspaceContext = {
  workspaceId: string;
  role: "owner" | "admin" | "pm" | "viewer";
};

export async function ensureUserWorkspace(userId: string) {
  const supabase = createSupabaseServiceRoleClient({
    routeId: "lib.workspaces",
    operation: "ensure_workspace",
    reason: "workspace_bootstrap",
    systemActor: "system",
    actorUserId: userId,
  });

  const { data: oldestMembership, error: membershipError } = await supabase
    .from("workspace_memberships")
    .select("workspace_id,role")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ workspace_id: string; role: WorkspaceContext["role"] }>();

  if (membershipError) {
    throw new Error(`Unable to resolve workspace membership: ${membershipError.message}`);
  }

  if (oldestMembership?.workspace_id) {
    return {
      workspaceId: oldestMembership.workspace_id,
      role: oldestMembership.role,
      created: false,
    };
  }

  const { data: createdWorkspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: "Workspace",
      created_by_user_id: userId,
    })
    .select("id")
    .single<{ id: string }>();

  if (workspaceError || !createdWorkspace?.id) {
    throw new Error(`Unable to initialize workspace: ${workspaceError?.message ?? "unknown"}`);
  }

  const { error: membershipCreateError } = await supabase
    .from("workspace_memberships")
    .insert({
      workspace_id: createdWorkspace.id,
      user_id: userId,
      role: "owner",
    });

  if (membershipCreateError) {
    throw new Error(`Unable to initialize workspace membership: ${membershipCreateError.message}`);
  }

  return {
    workspaceId: createdWorkspace.id,
    role: "owner" as const,
    created: true,
  };
}

export async function ensureUserWorkspaceForAuthenticatedUser(user: AuthUserContext) {
  const context = await resolveBootstrapRuntimeContext(user);

  return {
    workspaceId: context.workspaceId,
    role: "owner" as const,
    created: context.createdWorkspace,
  };
}

export async function getUserWorkspaces(userId: string): Promise<WorkspaceRow[]> {
  const supabase = await createSupabaseServerClient();

  const { data: memberships, error: membershipsError } = await supabase
    .from("workspace_memberships")
    .select("workspace_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (membershipsError) {
    throw new Error(`Unable to list workspace memberships: ${membershipsError.message}`);
  }

  const workspaceIds = [
    ...new Set((memberships ?? []).map((row) => row.workspace_id).filter(Boolean)),
  ];

  if (!workspaceIds.length) {
    return [];
  }

  const { data: workspaces, error: workspacesError } = await supabase
    .from("workspaces")
    .select("id,name")
    .in("id", workspaceIds)
    .order("created_at", { ascending: true });

  if (workspacesError) {
    throw new Error(`Unable to resolve workspaces: ${workspacesError.message}`);
  }

  return (workspaces ?? []) as WorkspaceRow[];
}

export function resolveCanonicalWorkspaceForUser(workspaces: WorkspaceRow[]): WorkspaceRow | null {
  return workspaces[0] ?? null;
}

export async function getActiveWorkspaceContext(userId: string): Promise<WorkspaceContext> {
  const workspaces = await getUserWorkspaces(userId);
  const canonicalWorkspace = resolveCanonicalWorkspaceForUser(workspaces);

  if (!canonicalWorkspace?.id) {
    throw new Error("Workspace context required.");
  }

  const supabase = await createSupabaseServerClient();

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_memberships")
    .select("workspace_id,role")
    .eq("workspace_id", canonicalWorkspace.id)
    .eq("user_id", userId)
    .maybeSingle<{ workspace_id: string; role: WorkspaceContext["role"] }>();

  if (membershipError) {
    throw new Error(`Unable to resolve active workspace membership: ${membershipError.message}`);
  }

  if (!membership?.workspace_id) {
    throw new Error("Workspace membership required.");
  }

  return {
    workspaceId: membership.workspace_id,
    role: membership.role,
  };
}
