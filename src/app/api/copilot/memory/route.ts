import { getAuthUser } from "@/lib/auth";
import { buildAmbientContextSummary, readProjectMemorySnapshot } from "@/lib/memory/organization-memory";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim();
  if (!projectId) return Response.json(buildAmbientContextSummary(null));

  const snapshot = await readProjectMemorySnapshot(projectId);
  return Response.json(buildAmbientContextSummary(snapshot));
}
