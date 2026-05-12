import { getAuthUser } from "@/lib/auth";
import { routeOperationalInput } from "@/lib/input-routing";
import { listOperationalMemory } from "@/lib/operational-memory";
import type { InputHubMode } from "@/lib/operational-classifier";
import { AccessDeniedError, requireProjectAccess } from "@/lib/security/access-guards";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (projectId?.trim()) {
    try {
      await requireProjectAccess(projectId.trim());
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        console.warn("[security] input_hub_read_denied", error.metadata);
        return Response.json({ error: "Invalid project context." }, { status: 403 });
      }
      throw error;
    }
  }
  const records = await listOperationalMemory(user.companyId, projectId);
  return Response.json({ records: records.slice(0, 12) });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    projectId?: string | null;
    mode?: InputHubMode;
    title?: string;
    text?: string;
    contextNote?: string;
    fileName?: string;
    mimeType?: string;
  };

  if (!body.mode || !body.title || !body.text) {
    return Response.json({ error: "mode, title, text required" }, { status: 400 });
  }
  if (body.projectId?.trim()) {
    try {
      await requireProjectAccess(body.projectId.trim());
    } catch (error) {
      if (error instanceof AccessDeniedError) {
        console.warn("[security] input_hub_write_denied", error.metadata);
        return Response.json({ error: "Invalid project context." }, { status: 403 });
      }
      throw error;
    }
  }

  const result = await routeOperationalInput({
    companyId: user.companyId,
    projectId: body.projectId ?? null,
    mode: body.mode,
    title: body.title,
    text: body.text,
    sourceRef: `${user.id}:${body.mode}`,
    contextNote: body.contextNote,
    fileName: body.fileName,
    mimeType: body.mimeType,
  });

  return Response.json({ result }, { status: 201 });
}
