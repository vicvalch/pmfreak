# Access Control Matrix (Current)

## Runtime basis
- RBAC remains foundational permission source (`src/lib/security/rbac.ts`).
- Governance runtime adds action-level orchestration, explainability, and auditing.

## Actor distinction
- **user**: evaluated via workspace/project guards.
- **ai_agent**: must pass attestation and explicit scoped permission.
- **system**: must provide explicit `systemActor` context for privileged actions.

## Current state classification
- No longer static-only RBAC.
- Current implementation is an **early policy engine** and **governance-aware SaaS layer**.
- Not protocol-ready yet (approval protocols and external policy exchange absent).
