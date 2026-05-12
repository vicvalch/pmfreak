import { requireProjectPermission, requireWorkspaceMembership } from "@/lib/security/access-guards";
import { readProjectMemorySnapshot } from "@/lib/memory/organization-memory";
import { buildStakeholderRelationshipSnapshot } from "@/lib/stakeholder-intelligence";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim() ?? "";
  const workspaceId = searchParams.get("workspaceId")?.trim() ?? "";

  if (workspaceId) {
    try { await requireWorkspaceMembership(workspaceId); } catch { return Response.json({ error: "Invalid workspace context." }, { status: 403 }); }
  }

  if (!projectId) {
    return Response.json(buildStakeholderRelationshipSnapshot(null, null));
  }

  try { await requireProjectPermission(projectId, "read"); } catch { return Response.json({ error: "Invalid project context." }, { status: 403 }); }

  const snapshot = await readProjectMemorySnapshot(projectId);
  return Response.json(buildStakeholderRelationshipSnapshot(projectId, snapshot));
}
