import { getAuthUser } from "@/lib/auth";
import { buildContinuityContext } from "@/lib/operational-memory-v1";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim() ?? null;
  const continuity = await buildContinuityContext(user.companyId, projectId);

  return Response.json({
    blockers: continuity.blockers.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`),
    recentDecisions: continuity.decisions.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`),
    stakeholderPressure: continuity.stakeholders.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`),
    criticalRisks: continuity.risks.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`),
    concerns: continuity.unresolved.map((item) => `${item.memoryText} (from ${item.sourceType}:${item.sourceReference})`).slice(0, 8),
  });
}
