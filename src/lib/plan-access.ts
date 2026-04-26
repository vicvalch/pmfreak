import type { SubscriptionPlan } from "@/lib/billing";

export const canRunAiAnalysis = (plan: SubscriptionPlan) => plan === "pro" || plan === "enterprise";

export const canExportReports = (plan: SubscriptionPlan) => plan === "pro" || plan === "enterprise";

export const canInviteTeamMembers = (plan: SubscriptionPlan) => plan === "enterprise";

export const canUsePortfolioMemory = (plan: SubscriptionPlan) => plan === "enterprise";
