import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserWorkspace } from "@/lib/workspaces";
import { AccessDeniedError } from "@/lib/security/access-guards";
import { denyResponse } from "@/lib/security/deny-response";
import { requireAuthenticatedUser } from "@/lib/security/server-authorization";

export async function GET() {
  try {
    const { user } = await requireAuthenticatedUser();

    // Use ensureUserWorkspace (service-role) instead of getUserWorkspaces (session client +
    // FK join) because:
    //   a) getUserWorkspaces relies on a workspaces FK join that can be blocked by RLS.
    //   b) requireWorkspaceMember maps "read" → "project.read" (projectScoped: true) which
    //      the governance pipeline always denies when projectId is absent.
    // ensureUserWorkspace is idempotent, service-role-backed, and guaranteed to return
    // the authenticated user's workspace.
    const workspace = await ensureUserWorkspace(user.id);
    const workspaceId = workspace.workspaceId;

    console.log("[api/projects] workspace resolved", {
      userId: user.id,
      workspaceId,
      workspaceCreated: workspace.created,
    });

    const supabase = await createSupabaseServerClient();
    const { data: projects, error } = await supabase
      .from("projects")
      .select("id,name")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api/projects] project fetch error", { userId: user.id, workspaceId, error: error.message });
    }

    console.log("[api/projects] projects resolved", {
      userId: user.id,
      workspaceId,
      projectCount: projects?.length ?? 0,
    });

    return NextResponse.json({ projects: projects ?? [] });
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      if (String(error.metadata.reason) === "unauthorized") {
        return denyResponse({ status: 401, routeId: "/api/projects", message: "Unauthorized", reason: "unauthorized" });
      }
      return denyResponse({ status: 403, routeId: "/api/projects", message: "Forbidden", reason: String(error.metadata.reason ?? "denied"), actorUserId: undefined, eventType: "workspace_scope_violation" });
    }
    console.error("[api/projects] unexpected error", { error: String(error) });
    throw error;
  }
}
