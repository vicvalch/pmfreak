import {
  enforceEnforcementPipeline,
  type GovernanceEvaluationInput,
  type GovernanceDecisionState,
} from "@aoc-enterprise/runtime";
import { ensurePmfreakAocAdaptersRegistered } from "@/lib/aoc/bootstrap";

export type EnterpriseRuntimeDecision = {
  allowed: boolean;
  decisionId: string;
  decisionSource: "enterprise-runtime" | "policy-simulation" | "compatibility-adapter";
  authoritative: boolean;
  decision: GovernanceDecisionState;
  enforcementLevel: "hard" | "soft";
  reason: string;
  evaluatedAt: string;
  evaluatedPolicies: string[];
  evaluatedCapabilities: string[];
  evaluatedRoles: string[];
  auditRequired: boolean;
  trustContext: { actorType: string; actorUserId: string | null; actorAgentId: string | null; riskLevel: string };
  runtimeMetadata: Record<string, unknown>;
};

export function normalizeRuntimeDecision(decision: Awaited<ReturnType<typeof enforceEnforcementPipeline>>["decision"]): EnterpriseRuntimeDecision {
  return {
    allowed: decision.allowed,
    decisionId: decision.decisionId,
    decisionSource: "enterprise-runtime",
    authoritative: true,
    decision: decision.decision,
    enforcementLevel: decision.allowed ? "soft" : "hard",
    reason: decision.reason,
    evaluatedAt: decision.evaluatedAt,
    evaluatedPolicies: [decision.matchedPolicy],
    evaluatedCapabilities: [decision.requiredPermission],
    evaluatedRoles: [],
    auditRequired: true,
    trustContext: {
      actorType: decision.actor.type,
      actorUserId: decision.actor.userId,
      actorAgentId: decision.actor.agentId,
      riskLevel: decision.riskLevel,
    },
    runtimeMetadata: {
      status: decision.status,
      requiredApprovalType: decision.requiredApprovalType,
      reviewerRoleRequired: decision.reviewerRoleRequired,
      trace: decision.trace,
      scope: decision.scope,
      evaluatedAt: decision.evaluatedAt,
    },
  };
}

export async function authorizeRuntimeAction(input: GovernanceEvaluationInput) {
  ensurePmfreakAocAdaptersRegistered();
  const result = await enforceEnforcementPipeline(input);
  return normalizeRuntimeDecision(result.decision);
}
