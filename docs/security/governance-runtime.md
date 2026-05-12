# Governance Runtime (Phase 5.1)

## Enforced now
- Central runtime in `src/lib/security/governance-runtime.ts` evaluates governed actions via `evaluateGovernanceAction`, explains via `explainGovernanceDecision`, and blocks via `enforceGovernanceAction`.
- Runtime composes existing primitives: workspace membership, project permission, governance permission, agent scope, and agent attestation.
- Decisions include actor, scope, permission, risk, matched policy, reason, and trace.
- Route integrations: `/api/copilot`, `/api/upload`, `/api/billing/create-checkout-session`.

## Prepared for future (not enforced yet)
- Decision state model supports `require_human_approval`, `require_admin_approval`, `require_additional_scope`.
- System/privileged action policy slot (`privileged.use`) exists for future workflow gating.

## Not implemented yet
- Multi-step approvals and delegated approval workflows.
- External protocol interoperability (AOC protocol).
- Dynamic policy authoring/DSL.


## Phase 5.1 note
- Approval-aware governance is now implemented as a minimal runtime layer; this is not AOC protocol integration yet.
