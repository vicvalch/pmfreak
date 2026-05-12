import { requireProjectPermission, requireWorkspaceMembership } from "@/lib/security/access-guards";
import { buildExecutionRiskSnapshot } from "@/lib/execution-risk";
import { buildInterventionSnapshot } from "@/lib/intervention-engine";
import { readProjectMemorySnapshot } from "@/lib/memory/organization-memory";
import { buildStakeholderRelationshipSnapshot } from "@/lib/stakeholder-intelligence";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim() ?? "";
  const workspaceId = searchParams.get("workspaceId")?.trim() ?? "";

  if (workspaceId) {
    try { await requireWorkspaceMembership(workspaceId); } catch { return Response.json({ error: "Invalid workspace context." }, { status: 403 }); }
  }

  let snapshot = null;

  if (projectId) {
    try { await requireProjectPermission(projectId, "read"); } catch { return Response.json({ error: "Invalid project context." }, { status: 403 }); }
    snapshot = await readProjectMemorySnapshot(projectId);
  }

  const intervention = buildInterventionSnapshot(projectId || null, snapshot);

  // Deterministic aggregation endpoint for intervention infra; all signals are explainable
  // and intentionally machine-readable for future autonomous intervention systems.
  return Response.json({
    projectId: projectId || null,
    workspaceId: workspaceId || null,
    generatedAt: intervention.generatedAt,
    executionRisk: buildExecutionRiskSnapshot(projectId || null, snapshot),
    stakeholderIntelligence: buildStakeholderRelationshipSnapshot(projectId || null, snapshot),
    organizationalMemory: snapshot,
    deliveryTelemetry: intervention.deliveryInstability,
    intervention,
  });
}
