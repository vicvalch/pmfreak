import { getAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AccessDeniedError, requireProjectAccess } from "@/lib/security/access-guards";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const user = await getAuthUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const projectId = id.trim();

  if (!projectId) {
    return Response.json({ error: "projectId is required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  try {
    await requireProjectAccess(projectId);
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      console.warn("[security] project_route_access_denied", error.metadata);
      return Response.json({ error: "Invalid project context." }, { status: 403 });
    }
    throw error;
  }

  const { data: project } = await supabase.from("projects").select("id, name").eq("id", projectId).maybeSingle();

  if (!project) {
    return Response.json({ error: "Invalid project context." }, { status: 403 });
  }

  return Response.json(project);
}
