import { getAuthUser } from "@/lib/auth";
import { denyResponse } from "@/lib/security/deny-response";
import { createPrivilegedSupabaseClient } from "@/lib/security/privileged-access";
import { issueDelegatedCapability } from "@/lib/security/delegated-capabilities";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return denyResponse({ status: 401, routeId: "/api/v1/delegations", message: "Unauthorized", reason: "unauthorized" });
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  if (!workspaceId) return Response.json({ ok: false, error: { code: "workspace_required", message: "workspaceId required" } }, { status: 400 });
  // TODO: NEEDS_RLS — governance_delegations SELECT policy references public.workspace_members
  // (non-existent table; correct name is public.workspace_memberships); fix the migration,
  // then replace createPrivilegedSupabaseClient with scoped client
  // AUDIT_REF: service-role-risk-register.md second-pass
  const supabase = createPrivilegedSupabaseClient({ routeId: "/api/v1/delegations", operation: "list_delegations", reason: "governance_view", systemActor: "system", workspaceId, actorUserId: user.id });
  const { data, error } = await supabase.from("governance_delegations").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(200);
  if (error) return Response.json({ ok: false, error: { code: "query_failed", message: error.message } }, { status: 500 });
  return Response.json({ ok: true, delegations: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return denyResponse({ status: 401, routeId: "/api/v1/delegations", message: "Unauthorized", reason: "unauthorized" });
  const body = await request.json();
  const issued = await issueDelegatedCapability({ ...body, delegatorUserId: user.id });
  return Response.json({ ok: true, delegation: issued.delegation, delegationToken: issued.delegationToken });
}
