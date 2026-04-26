import { getAuthUser } from "@/lib/auth";
import { getCompanySubscription } from "@/lib/billing";
import { canExportReports, canRunAiAnalysis, canUsePortfolioMemory } from "@/lib/plan-access";
import { getCompanyUsage, getUploadLimitForPlan } from "@/lib/usage-limits";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getCompanySubscription(user.companyId);
  const usage = await getCompanyUsage(user.companyId);

  return Response.json({
    subscription,
    usage,
    limits: {
      uploadLimit: getUploadLimitForPlan(subscription.plan),
      canRunAiAnalysis: canRunAiAnalysis(subscription.plan),
      canExportReports: canExportReports(subscription.plan),
      canUsePortfolioMemory: canUsePortfolioMemory(subscription.plan),
    },
  });
}
