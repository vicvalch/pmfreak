import { requireProjectPermission } from "@/lib/security/access-guards";
import { buildMockOperationalIntelligence } from "@/lib/operational-intelligence";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim() ?? "";
  if (projectId) {
    try { await requireProjectPermission(projectId, "read"); } catch { return Response.json({ error: "Invalid project context." }, { status: 403 }); }
  }

  const operational = buildMockOperationalIntelligence(projectId || null);

  return Response.json({ mode: "live_telemetry_mock", generatedAt: new Date().toISOString(), projectId: projectId || null, ...operational });
}
