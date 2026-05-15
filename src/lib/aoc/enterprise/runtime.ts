import {
  enforceGovernanceAction,
  evaluateGovernanceAction,
  type GovernanceEvaluationInput,
} from "@/lib/security/governance-runtime";

/**
 * AOC Enterprise runtime boundary for PMFreak product code.
 *
 * TODO(aoc-migration): replace these delegations with @aoc-enterprise/runtime imports.
 */
export async function evaluateRuntimeAuthorization(input: GovernanceEvaluationInput) {
  return evaluateGovernanceAction(input);
}

export async function enforceRuntimeAuthorization(input: GovernanceEvaluationInput) {
  return enforceGovernanceAction(input);
}
