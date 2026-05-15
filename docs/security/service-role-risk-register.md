# Service-Role Risk Register (Phase 4.6)

## Audit summary (2026-05-15)

- **Total service role consumers:** 28 files
- **Legitimate consumers:** 28 files (all usages determined to be legitimate)
- **Reduced consumers:** 0 (no usages swapped to scoped client — all are genuinely required)
- **Registry file:** `src/lib/security/privileged-access-registry.ts`

## Active privileged surfaces

### HIGH risk (17 files)

| File | Purpose |
|------|---------|
| `src/lib/security/agent-attestation.ts` | Nonce replay protection primitive — must bypass RLS so a compromised token cannot suppress its own revocation record |
| `src/lib/security/telemetry.ts` | Security audit trail — must persist events even when user session is invalid; actor must not control their own audit log |
| `src/lib/security/governance-runtime.ts` | Approval request persistence — system writes on behalf of requesting actor |
| `src/lib/security/trust-domains.ts` | Trust domain and signing key lifecycle — cross-tenant, cannot be governed by single-tenant RLS |
| `src/lib/security/trust-handshakes.ts` | External verifier handshake protocol — cross-tenant by design |
| `src/lib/security/trust-coordination.ts` | Revocation registry, trust graph, policy lifecycle — must be authoritative cross-tenant |
| `src/aoc/enterprise/runtime/execution-grants.ts` | Governance execution grants — spans approval, actor, and resource tables across user RLS boundaries |
| `src/aoc/enterprise/runtime/delegated-capabilities.ts` | Delegation chains — traverse records owned by multiple actors |
| `src/app/api/governance/approvals/[id]/approve/route.ts` | Governance approval decision (approve) — cross-ownership reads and grant issuance |
| `src/app/api/governance/approvals/[id]/reject/route.ts` | Governance approval decision (reject) — cross-ownership writes and grant revocation |
| `src/app/api/governance/trust/handshakes/route.ts` | Admin handshake listing — cross-tenant view |
| `src/app/api/governance/trust/events/route.ts` | Cross-verifier trust event listing — cross-tenant sync data |
| `src/app/api/governance/trust/events/import/route.ts` | Trust event ingestion from external verifiers — cross-tenant with external origin |
| `src/lib/billing.ts` | Stripe webhook idempotency guard — no user session context available |
| `src/lib/workspaces.ts` | Workspace bootstrap on first login — user has no workspace yet; RLS would block |
| `src/lib/feature-gates.ts` | `auth.admin.getUserById()` — only available via service role; no scoped alternative |
| `src/lib/db/supabase-server.ts` | Legacy admin client factory — bypasses PrivilegedAccessContext tracking; no active external callers confirmed |

### MEDIUM risk (11 files)

| File | Purpose |
|------|---------|
| `src/app/(protected)/layout.tsx` | Trial status enforcement — system writes trial expiry across workspace boundaries |
| `src/app/(protected)/accept-invite/[token]/page.tsx` | Invitation acceptance — user not yet a member of target workspace |
| `src/app/(protected)/early-access/page.tsx` | Founder early access dashboard — cross-workspace read-only view |
| `src/app/api/early-access/summary/route.ts` | Founder summary API — cross-workspace system operation |
| `src/lib/early-access.ts` | Early access invite/trial lifecycle — system-managed records |
| `src/lib/first-user-telemetry.ts` | First-user onboarding telemetry — may run before authenticated session |
| `src/app/api/governance/delegations/route.ts` | Delegation listing — cross-actor governance data |
| `src/app/api/v1/delegations/route.ts` | V1 delegation listing and issuance — cross-actor governance data |
| `src/app/api/governance/trust/keys/route.ts` | Public key discovery — reads public key metadata for external verifiers |
| `src/app/api/governance/trust/.well-known/capability-issuer/route.ts` | Capability issuer discovery — public .well-known metadata endpoint |
| `src/lib/workspace-team.ts` | Workspace member invitations — invited user not yet a member; seat counts are cross-user |

## Controls in place

- Explicit privileged context contract (`routeId`, `operation`, `reason`, and either `actorUserId` or `systemActor`) enforced by `assertContext` in `createPrivilegedSupabaseClient`.
- `privileged_client_used` telemetry event logged on every service role client acquisition (except recursion-bypass path).
- `PRIVILEGED_ACCESS:` inline comment above every HIGH risk usage site.
- `AUDIT_REF: service-role-risk-register.md` cross-reference on every HIGH risk usage.
- Authoritative inventory at `src/lib/security/privileged-access-registry.ts` with `assertPrivilegedAccessJustified(file)` guard for future security reviews.
- Governance permission checks on all member/billing control paths.
- Webhook actor set to `systemActor: "stripe_webhook"` for audit trail isolation.

## Remaining risks

- Service-role blast radius remains high if server runtime is compromised — the registry and context contract reduce but cannot eliminate this risk without additional infrastructure controls (e.g., per-operation IAM roles, network-level egress filtering).
- `src/lib/db/supabase-server.ts` defines a legacy client (`createSupabaseAdminClient`) that bypasses context tracking. No active external callers confirmed; this should be deleted once confirmed unused.
- Replay prevention for agent attestation is implemented via nonce-based persistence in `agent_attestation_nonces`. Each token's SHA-256 hash is recorded on first use; subsequent uses are rejected with `replay_detected`. Expired rows can be purged via `purge_expired_nonces()`.
