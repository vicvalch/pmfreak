import { getAuthUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authorizeRuntimeAction } from "@/lib/aoc/enterprise/authorization";
import { buildEnterpriseRuntimeRequest } from "@/lib/aoc/pmfreak-runtime-consumer";
import { SDK_GOVERNANCE_ACTIONS } from "@/lib/aoc/runtime/governance-actions";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  if (!workspaceId) return Response.json({ error: "workspaceId required" }, { status: 400 });

  const decision = await authorizeRuntimeAction(
    buildEnterpriseRuntimeRequest({ user, action: SDK_GOVERNANCE_ACTIONS.AGENTS_READ, routeId: "/api/sdk/agents", workspaceId, resourceType: "workspace", resourceId: workspaceId }),
  );
  if (!decision.allowed) return Response.json({ error: "Forbidden", decisionId: decision.decisionId }, { status: 403 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("ai_agents").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ agents: data ?? [], decisionId: decision.decisionId });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.workspaceId) return Response.json({ error: "workspaceId required" }, { status: 400 });

  const decision = await authorizeRuntimeAction(
    buildEnterpriseRuntimeRequest({ user, action: SDK_GOVERNANCE_ACTIONS.AGENTS_MANAGE, routeId: "/api/sdk/agents", workspaceId: body.workspaceId, resourceType: "workspace", resourceId: body.workspaceId }),
  );
  if (!decision.allowed) return Response.json({ error: "Forbidden", decisionId: decision.decisionId }, { status: 403 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("ai_agents").insert({ workspace_id: body.workspaceId, name: body.name, description: body.description ?? "", agent_type: body.agentType ?? "copilot", created_by_user_id: user.id, owner_user_id: user.id, purpose: body.purpose ?? "", risk_level: body.riskLevel ?? "medium", metadata: body.metadata ?? {} }).select("*").single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, agent: data, decisionId: decision.decisionId });
}
