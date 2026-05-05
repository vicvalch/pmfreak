import { getCompanySubscription } from "@/lib/billing";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { canInviteTeamMembers as canInviteTeamMembersByPlan, canRunAiAnalysis } from "@/lib/plan-access";

const getCompanyIdByUserId = async (userId: string) => {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return null;
  }

  const metadata = data.user.user_metadata ?? {};
  const companyId = typeof metadata.company_id === "string" ? metadata.company_id : data.user.id;
  return companyId;
};

type RequiredPlan = "pro" | "pmo";

const PROJECT_LIMITS: Record<"free" | "pro" | "pmo", number> = {
  free: 3,
  pro: 25,
  pmo: Number.MAX_SAFE_INTEGER,
};

const upgradeRequired = (feature: string, requiredPlan: RequiredPlan) => ({
  ok: false as const,
  code: "upgrade_required" as const,
  error: "upgrade_required" as const,
  feature,
  requiredPlan,
  message: `${feature} requires a ${requiredPlan.toUpperCase()} subscription.`,
});

export async function canCreatePmoWorkspace(userId: string) {
  const companyId = await getCompanyIdByUserId(userId);
  if (!companyId) return upgradeRequired("pmo_workspace", "pmo");

  const subscription = await getCompanySubscription(companyId, { useServiceRole: true });
  return subscription.plan === "pmo" ? { ok: true as const, plan: subscription.plan } : upgradeRequired("pmo_workspace", "pmo");
}

export async function canUseAdvancedAi(userId: string) {
  const companyId = await getCompanyIdByUserId(userId);
  if (!companyId) return upgradeRequired("advanced_ai", "pro");

  const subscription = await getCompanySubscription(companyId, { useServiceRole: true });
  return canRunAiAnalysis(subscription.plan)
    ? { ok: true as const, plan: subscription.plan }
    : upgradeRequired("advanced_ai", "pro");
}

export async function canInviteTeamMembers(userId: string) {
  const companyId = await getCompanyIdByUserId(userId);
  if (!companyId) return upgradeRequired("team_invites", "pmo");

  const subscription = await getCompanySubscription(companyId, { useServiceRole: true });
  return canInviteTeamMembersByPlan(subscription.plan)
    ? { ok: true as const, plan: subscription.plan }
    : upgradeRequired("team_invites", "pmo");
}

export async function canCreateMoreProjects(userId: string) {
  const companyId = await getCompanyIdByUserId(userId);
  if (!companyId) return upgradeRequired("personal_projects", "pro");

  const supabase = createSupabaseServiceRoleClient();
  const subscription = await getCompanySubscription(companyId, { useServiceRole: true });
  const { count, error } = await supabase.from("projects").select("id", { head: true, count: "exact" }).eq("user_id", userId);

  if (error) {
    throw new Error(`Unable to verify project limit: ${error.message}`);
  }

  const limit = PROJECT_LIMITS[subscription.plan];
  return (count ?? 0) < limit
    ? { ok: true as const, plan: subscription.plan, projectLimit: limit }
    : upgradeRequired("personal_projects", "pro");
}

export async function canUsePmoFeature(userId: string, feature: string) {
  const access = await canCreatePmoWorkspace(userId);
  if (access.ok) {
    return access;
  }

  return upgradeRequired(feature, "pmo");
}
