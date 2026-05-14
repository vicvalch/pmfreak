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
  const { data, error } = await supabase.from("capability_grants").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (error) return sdkDbError(meta, "/api/sdk/capabilities/grants", error.message, auth.user.id, workspaceId);
  return apiOk({ grants: data ?? [] }, meta);
}
