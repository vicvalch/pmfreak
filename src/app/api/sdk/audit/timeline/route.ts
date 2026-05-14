import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiOk, getRequestId } from "@/lib/api/http";
import { requireSdkUser, sdkDbError, sdkWorkspaceRequired } from "../../_shared";

export async function GET(request: Request) {
  const meta = { requestId: getRequestId(request), version: "v1" };
  const auth = await requireSdkUser(meta);
  if ("response" in auth) return auth.response;
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  if (!workspaceId) return sdkWorkspaceRequired(meta);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("capability_audit_events").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(200);
  if (error) return sdkDbError(meta, "/api/sdk/audit/timeline", error.message, auth.user.id, workspaceId);
  return apiOk({ timeline: data ?? [] }, meta);
}
