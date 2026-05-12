import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/lib/workspaces";
import { requireWorkspaceMembership } from "@/lib/security/access-guards";

export async function GET() {
  const user = await requireAuthUser();
  const supabase = await createSupabaseServerClient();
  const workspaces = await getUserWorkspaces(user.id);
  const workspaceId = workspaces[0]?.id;
  if (!workspaceId) return NextResponse.json({ projects: [] });
  await requireWorkspaceMembership(workspaceId);
  const { data: projects } = await supabase.from("projects").select("id,name").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  return NextResponse.json({ projects: projects ?? [] });
}
