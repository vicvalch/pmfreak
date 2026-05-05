import type { SubscriptionPlan } from "@/lib/billing";

export const canRunAiAnalysis = (plan: SubscriptionPlan) => plan === "pro" || plan === "pmo";

export const canExportReports = (plan: SubscriptionPlan) => plan === "pro" || plan === "pmo";

export const canInviteTeamMembers = (plan: SubscriptionPlan) => plan === "pmo";

export const canUsePortfolioMemory = (plan: SubscriptionPlan) => plan === "pmo";
