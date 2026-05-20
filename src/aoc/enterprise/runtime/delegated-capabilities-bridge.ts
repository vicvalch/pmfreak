import {
  buildAuthorityLineage,
  consumeDelegatedCapability,
  evaluateDelegatedAccess,
  explainDelegationChain,
  issueDelegatedCapability,
  resolveAuthorityChain,
  revokeDelegatedCapability,
  validateDelegatedCapability,
  type DelegationConstraints,
  type DelegationDecision,
  type DelegationInput,
} from "@/lib/security/delegated-capabilities";

export {
  buildAuthorityLineage,
  consumeDelegatedCapability,
  evaluateDelegatedAccess,
  explainDelegationChain,
  issueDelegatedCapability,
  resolveAuthorityChain,
  revokeDelegatedCapability,
  validateDelegatedCapability,
};
export type { DelegationConstraints, DelegationDecision, DelegationInput };
