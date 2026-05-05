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

const upgradeRequired = (feature: string) => ({
  ok: false as const,
  code: "upgrade_required" as const,
  message: `${feature} requires a paid subscription.`,
});

export async function canCreatePmoWorkspace(userId: string) {
  const companyId = await getCompanyIdByUserId(userId);
  if (!companyId) return upgradeRequired("PMO workspaces");

  const subscription = await getCompanySubscription(companyId, { useServiceRole: true });
  return subscription.plan === "pmo" ? { ok: true as const, plan: subscription.plan } : upgradeRequired("PMO workspaces");
}

export async function canUseAdvancedAi(userId: string) {
  const companyId = await getCompanyIdByUserId(userId);
  if (!companyId) return upgradeRequired("Advanced AI actions");

  const subscription = await getCompanySubscription(companyId, { useServiceRole: true });
  return canRunAiAnalysis(subscription.plan)
    ? { ok: true as const, plan: subscription.plan }
    : upgradeRequired("Advanced AI actions");
}

export async function canInviteTeamMembers(userId: string) {
  const companyId = await getCompanyIdByUserId(userId);
  if (!companyId) return upgradeRequired("Team member invites");

  const subscription = await getCompanySubscription(companyId, { useServiceRole: true });
  return canInviteTeamMembersByPlan(subscription.plan)
    ? { ok: true as const, plan: subscription.plan }
    : upgradeRequired("Team member invites");
}
