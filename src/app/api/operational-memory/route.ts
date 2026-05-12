import { getAuthUser } from "@/lib/auth";
import {
  appendOperationalMemory,
  extractOperationalMemoryCandidates,
  getOperationalMemory,
  MEMORY_TYPES,
  type MemoryType,
  type MemorySourceType,
} from "@/lib/operational-memory-v1";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId")?.trim() ?? null;
  const unresolvedOnly = searchParams.get("unresolvedOnly") === "true";
  const type = searchParams.get("memoryType")?.trim() as MemoryType | undefined;

  const records = await getOperationalMemory({
    companyId: user.companyId,
    projectId,
    unresolvedOnly,
    memoryTypes: type && MEMORY_TYPES.includes(type) ? [type] : undefined,
    limit: 50,
  });

  return Response.json({ records });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    projectId?: string | null;
    text?: string;
    sourceType?: MemorySourceType;
    sourceReference?: string;
  };

  if (!body.text?.trim()) return Response.json({ error: "text required" }, { status: 400 });

  const candidates = extractOperationalMemoryCandidates({
    text: body.text,
    sourceType: body.sourceType ?? "manual",
    sourceReference: body.sourceReference ?? "manual-entry",
  });

  const inserted = await appendOperationalMemory({
    companyId: user.companyId,
    projectId: body.projectId?.trim() || null,
    entries: candidates,
  });

  return Response.json({ insertedCount: inserted.length, records: inserted }, { status: 201 });
}
