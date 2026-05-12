import { NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await requireAuthUser();
  const supabase = await createSupabaseServerClient();
  const { data: membership } = await supabase.from("workspace_memberships").select("workspace_id").eq("user_id", user.id).maybeSingle();
  if (!membership?.workspace_id) return NextResponse.json({ projects: [] });
  const { data: projects } = await supabase.from("projects").select("id,name").eq("workspace_id", membership.workspace_id).order("created_at", { ascending: false });
  return NextResponse.json({ projects: projects ?? [] });
}
