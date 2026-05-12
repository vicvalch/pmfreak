import { getAuthUser } from "@/lib/auth";
import { buildContinuityContext } from "@/lib/operational-memory-v1";
import { AccessDeniedError, requireProjectAccess } from "@/lib/security/access-guards";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim() ?? null;
  if (projectId) {
    try {
      await requireProjectAccess(projectId);
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        console.warn("[security] copilot_memory_access_denied", error.metadata);
        return Response.json({ error: "Invalid project context." }, { status: 403 });
      }
      throw error;
    }
  }
  const continuity = await buildContinuityContext(user.companyId, projectId);

  return Response.json({
    blockers: continuity.blockers.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`),
    recentDecisions: continuity.decisions.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`),
    stakeholderPressure: continuity.stakeholders.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`),
    criticalRisks: continuity.risks.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`),
    concerns: continuity.unresolved.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`).slice(0, 8),
  });
}
