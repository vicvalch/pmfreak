import { NextResponse } from "next/server";

import { AccessDeniedError } from "@/lib/security/access-guards";
import { denyFromAccessError } from "@/lib/security/deny-response";
import { requireAuthenticatedUser, requireWorkspaceMember } from "@/lib/security/server-authorization";
import {
  getUserWorkspaces,
  resolveCanonicalWorkspaceForUser,
} from "@/lib/workspaces";
import { repairBootstrapWorkspace } from "@/lib/runtime/bootstrap/runtime";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const { user } = await requireAuthenticatedUser();

  let bootstrapRecovered = false;
  let workspaceId: string | null = null;

  try {
    let workspaces = await getUserWorkspaces(user.id);
    let canonicalWorkspace = resolveCanonicalWorkspaceForUser(workspaces);

    if (!canonicalWorkspace?.id) {
      const repaired = await repairBootstrapWorkspace(user);

      bootstrapRecovered =
        repaired.createdWorkspace || repaired.repairedMembership;

      workspaceId = repaired.workspaceId;

      workspaces = await getUserWorkspaces(user.id);
      canonicalWorkspace = resolveCanonicalWorkspaceForUser(workspaces);
    }

    workspaceId = canonicalWorkspace?.id ?? workspaceId;

    if (!workspaceId) {
      return NextResponse.json(
        {
          error: "Workspace bootstrap inconsistent.",
          reason: "workspace_bootstrap_inconsistent",
          bootstrapRecovered,
          projects: [],
        },
        { status: 409 },
      );
    }

    await requireWorkspaceMember(workspaceId);

    const supabase = await createSupabaseServerClient();

    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id,name,description,created_at,updated_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error("[projects] workspace query failed", {
        userId: user.id,
        workspaceId,
        error: projectsError.message,
      });

      return NextResponse.json(
        {
          error: "Workspace project data unavailable.",
          reason: "workspace_data_unavailable",
          workspaceId,
          bootstrapRecovered,
          projects: [],
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      workspaceId,
      bootstrapRecovered,
      projects: projects ?? [],
    });
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return denyFromAccessError(error, {
        status: 403,
        routeId: "/api/projects",
        message: "Workspace access denied.",
        actorUserId: user.id,
        workspaceId: workspaceId ?? undefined,
        eventType: "workspace_scope_violation",
      });
    }

    console.error("[projects] unexpected failure", {
      userId: user.id,
      workspaceId,
      error: String(error),
    });

    return NextResponse.json(
      {
        error: "Unexpected workspace project failure.",
        reason: "unexpected_workspace_failure",
        workspaceId,
        bootstrapRecovered,
        projects: [],
      },
      { status: 500 },
    );
  }
}
