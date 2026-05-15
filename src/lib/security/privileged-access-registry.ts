type PrivilegedAccessEntry = {
  readonly file: string;
  readonly purpose: string;
  readonly riskLevel: "HIGH" | "MEDIUM";
  readonly mitigations: readonly string[];
};

export const PRIVILEGED_ACCESS_REGISTRY: readonly PrivilegedAccessEntry[] = [
  {
    file: "src/lib/security/agent-attestation.ts",
    purpose: "Nonce-based replay protection for agent tokens: nonces are written on first use and checked before processing to prevent token reuse. Must bypass user RLS because a compromised token could be used to defeat its own revocation check.",
    riskLevel: "HIGH",
    mitigations: [
      "Nonce hashed with SHA-256 before storage",
      "Expires at token expiry time",
      "Race condition handled via unique-constraint (error code 23505)",
      "Replay attempts logged to security telemetry",
    ],
  },
  {
    file: "src/lib/security/telemetry.ts",
    purpose: "Security audit trail persistence: all security events (auth denials, scope violations, privileged access) are written to the security_events table. Must use service role because security events must be recorded even when the user session is invalid, and RLS on security_events must not be bypassable by the actor being logged.",
    riskLevel: "HIGH",
    mitigations: [
      "allowTelemetryRecursionBypass prevents infinite logging loops",
      "Metadata scrubbed of secrets (token, password, cookie, etc.) before persistence",
      "console.warn emitted as secondary channel",
    ],
  },
  {
    file: "src/lib/security/governance-runtime.ts",
    purpose: "Approval request persistence: governance decisions requiring human approval are persisted to governance_approval_requests. Must bypass RLS because the record is created by the system on behalf of the requesting actor, not by the actor directly.",
    riskLevel: "HIGH",
    mitigations: [
      "Only writes approval records after governance evaluation completes",
      "Workspace scope always enforced before write",
      "Logged to security telemetry via finalize()",
    ],
  },
  {
    file: "src/lib/security/trust-domains.ts",
    purpose: "Trust domain and signing key lifecycle management: reads/writes trust domains, signing keys, and verifier policies for the capability claims infrastructure. These tables span tenant boundaries and cannot be governed by single-tenant RLS.",
    riskLevel: "HIGH",
    mitigations: [
      "Only called from capability claim issuance and verification paths",
      "Key revocation immediately reflected in subsequent verifications",
      "All mutations logged to security telemetry",
    ],
  },
  {
    file: "src/lib/security/trust-handshakes.ts",
    purpose: "External verifier handshake protocol: manages the handshake lifecycle between this issuer and external verifiers. Cross-tenant by design — a verifier from one domain establishing trust with another domain cannot be scoped to either tenant's RLS context.",
    riskLevel: "HIGH",
    mitigations: [
      "Handshake token stored as SHA-256 hash only",
      "Expiry enforced at validation time",
      "Approvals require explicit admin action",
      "All state changes logged to security telemetry",
    ],
  },
  {
    file: "src/lib/security/trust-coordination.ts",
    purpose: "Trust graph, revocation registry, and trust anchor management: cross-tenant revocation checks and trust graph operations must be authoritative regardless of which tenant context initiates the query.",
    riskLevel: "HIGH",
    mitigations: [
      "Revocations immediately propagated to revocation registry",
      "Trust graph edges scoped by source/target domain",
      "Quarantine path for unsafe imports",
      "All mutations logged to security telemetry",
    ],
  },
  {
    file: "src/aoc/enterprise/runtime/execution-grants.ts",
    purpose: "Governance execution grant lifecycle: issues, validates, and consumes single-use execution grants after governance approval. Grants span approval request, actor, and resource tables that cross user-level RLS boundaries.",
    riskLevel: "HIGH",
    mitigations: [
      "Grant issued only after explicit governance approval",
      "Single-use enforced via atomic status transition to 'consumed'",
      "Token stored as SHA-256 hash only",
      "Replay attempts logged to security telemetry",
      "All operations scoped to workspaceId",
    ],
  },
  {
    file: "src/aoc/enterprise/runtime/delegated-capabilities.ts",
    purpose: "Delegated capability chain: issues, validates, revokes, and consumes delegated capabilities that may flow across user and agent actors within a workspace. The delegation chain resolver must traverse records owned by multiple actors.",
    riskLevel: "HIGH",
    mitigations: [
      "Delegation depth enforced (max 3 hops)",
      "Scope-broadening attempts blocked at assertion layer",
      "Self-delegation loops detected and rejected",
      "Token stored as SHA-256 hash only",
      "All operations scoped to workspaceId",
    ],
  },
  {
    file: "src/app/api/governance/approvals/[id]/approve/route.ts",
    purpose: "Governance approval decision (approve): reads and updates governance_approval_requests then issues an execution grant. The approval record belongs to the request actor, not necessarily the approving user, requiring cross-ownership reads.",
    riskLevel: "HIGH",
    mitigations: [
      "requireGovernancePermission enforced before any mutation",
      "Authenticated user required",
      "Expiry checked before approval is accepted",
      "Execution grant issued atomically on approval",
      "Logged to security telemetry",
    ],
  },
  {
    file: "src/app/api/governance/approvals/[id]/reject/route.ts",
    purpose: "Governance approval decision (reject): reads and updates governance_approval_requests and revokes associated execution grants. Same cross-ownership requirement as the approve path.",
    riskLevel: "HIGH",
    mitigations: [
      "requireGovernancePermission enforced before any mutation",
      "Authenticated user required",
      "Active grants revoked atomically on rejection",
      "Logged to security telemetry",
    ],
  },
  {
    file: "src/app/api/governance/trust/handshakes/route.ts",
    purpose: "Admin listing of all verifier handshakes across all trust domains. Cross-tenant by design — the admin view must show all handshakes regardless of workspace ownership.",
    riskLevel: "HIGH",
    mitigations: [
      "Serves admin/system review purposes only",
      "No sensitive key material exposed in response",
      "Results limited to 100 records",
    ],
  },
  {
    file: "src/app/api/governance/trust/events/route.ts",
    purpose: "Cross-verifier trust event listing: serves trust event data for trusted synchronization between verifiers. Events span trust domains and cannot be scoped to a single tenant's RLS context.",
    riskLevel: "HIGH",
    mitigations: [
      "Filterable by trust domain, event type, severity, and time window",
      "Results capped at 500 records",
      "Event data does not include secret key material",
    ],
  },
  {
    file: "src/app/api/governance/trust/events/import/route.ts",
    purpose: "Trust event ingestion from external verifiers: after handshake validation, persists incoming trust events to the local event store and triggers revocation registration. Cross-tenant operation with external origin.",
    riskLevel: "HIGH",
    mitigations: [
      "Handshake token validated before any write",
      "Event cryptographic signature verified before acceptance",
      "Rejected events logged to security telemetry",
      "Accepted events trigger revocation registry update",
    ],
  },
  {
    file: "src/lib/billing.ts",
    purpose: "Stripe webhook idempotency guard and subscription sync: Stripe webhooks arrive without a user session. The idempotency guard must write to billing_webhook_events atomically to prevent duplicate processing.",
    riskLevel: "HIGH",
    mitigations: [
      "Webhook signature verified before client is created",
      "systemActor set to 'stripe_webhook' for audit trail",
      "Idempotency enforced via unique constraint (error code 23505)",
      "Service role only used for webhook path; subscription reads use scoped client when possible",
    ],
  },
  {
    file: "src/lib/workspaces.ts",
    purpose: "Workspace bootstrap on first login: creates the user's default workspace and membership record. The user has no existing workspace at this point so RLS policies (which restrict access to workspace members) would block the write.",
    riskLevel: "HIGH",
    mitigations: [
      "actorUserId always set to the authenticated user performing bootstrap",
      "upsert with ignoreDuplicates prevents race-condition double-creation",
      "Only creates workspace if no existing membership found",
    ],
  },
  {
    file: "src/lib/feature-gates.ts",
    purpose: "Feature gate enforcement: getCompanyIdByUserId uses supabase.auth.admin.getUserById() which is only available via the service role client. canCreateMoreProjects counts all user projects for limit enforcement.",
    riskLevel: "HIGH",
    mitigations: [
      "auth.admin API requires service role — no scoped alternative exists",
      "Company ID resolved from user metadata, not user-controllable input",
      "Project count enforced server-side, never trusted from client",
    ],
  },
  {
    file: "src/lib/db/supabase-server.ts",
    purpose: "Legacy service-role client factory (createSupabaseAdminClient): creates a service role client without the mandatory PrivilegedAccessContext tracking. Defined for backward compatibility but bypasses telemetry and audit logging.",
    riskLevel: "HIGH",
    mitigations: [
      "console.warn emitted on every instantiation",
      "No active callers confirmed — defined but not externally imported",
      "New code must use createPrivilegedSupabaseClient from src/lib/security/privileged-access.ts",
    ],
  },
  {
    file: "src/app/(protected)/layout.tsx",
    purpose: "Trial status enforcement: reads workspace memberships and trial license status, then expires and records events for inactive trials. The trial expiry mutation and event insertion are system-level writes that must not be gated by the user's own RLS scope.",
    riskLevel: "MEDIUM",
    mitigations: [
      "Authenticated user required (requireAuthUser)",
      "Only executed for non-founder/non-internal users",
      "Trial expiry is idempotent (updates only active trials past end date)",
    ],
  },
  {
    file: "src/app/(protected)/accept-invite/[token]/page.tsx",
    purpose: "Workspace invitation acceptance: looks up invitation by opaque token and creates workspace membership. The invited user is not yet a member of the target workspace so RLS would block reading workspace_invitations and writing workspace_memberships.",
    riskLevel: "MEDIUM",
    mitigations: [
      "Authenticated user required",
      "Token validated for pending status and non-expiry before any write",
      "Membership write uses upsert to prevent duplicates",
      "Audit event written to workspace_audit_events on completion",
    ],
  },
  {
    file: "src/app/(protected)/early-access/page.tsx",
    purpose: "Founder early access dashboard: reads all early_access_invites, trial_licenses, workspace_activations, and telemetry for the founder operations view. Data spans all workspaces and cannot be scoped to a single user.",
    riskLevel: "MEDIUM",
    mitigations: [
      "Authenticated user required (requireAuthUser)",
      "Reads are display-only — no mutations from this page",
      "Results limited per table (limit 20–400)",
    ],
  },
  {
    file: "src/app/api/early-access/summary/route.ts",
    purpose: "Founder early access summary API: runs a trial expiry sweep and returns aggregate status across all invites, trials, activations, and events. Cross-workspace system operation.",
    riskLevel: "MEDIUM",
    mitigations: [
      "isFounderOrInternalUser check required before any operation",
      "Authenticated user required",
      "SQL sweep is idempotent (expires only active trials past end date)",
    ],
  },
  {
    file: "src/lib/early-access.ts",
    purpose: "Early access invite and trial lifecycle management: creates invites, sends emails, records trial events, approves/revokes access. These are system-managed records not owned by any single user.",
    riskLevel: "MEDIUM",
    mitigations: [
      "All mutations logged to early_access_events for audit trail",
      "Invite tokens generated with 24 random bytes (192 bits of entropy)",
      "Trial status transitions are explicit and logged",
    ],
  },
  {
    file: "src/lib/first-user-telemetry.ts",
    purpose: "First-user onboarding telemetry: persists anonymous onboarding events to first_user_telemetry_events. May be called before or without an authenticated user session during the onboarding flow.",
    riskLevel: "MEDIUM",
    mitigations: [
      "systemActor set to 'system' for audit trail",
      "No user-controlled data in operation payload beyond eventType enum",
      "Insert-only operation",
    ],
  },
  {
    file: "src/app/api/governance/delegations/route.ts",
    purpose: "Governance delegation listing: reads delegation records for a given workspaceId. Delegation data spans delegator and delegatee actors and may not be fully accessible under the authenticated user's RLS scope.",
    riskLevel: "MEDIUM",
    mitigations: [
      "Authenticated user required",
      "workspaceId parameter validated and required",
      "actorUserId set in privileged context for audit trail",
      "Read-only operation",
    ],
  },
  {
    file: "src/app/api/v1/delegations/route.ts",
    purpose: "V1 delegation listing and issuance: reads and creates delegation records. Same cross-actor justification as the governance delegations route.",
    riskLevel: "MEDIUM",
    mitigations: [
      "Authenticated user required",
      "workspaceId parameter validated and required",
      "actorUserId set in privileged context",
      "Delegation issuance policy enforcement delegated to issueDelegatedCapability",
    ],
  },
  {
    file: "src/app/api/governance/trust/keys/route.ts",
    purpose: "Public key discovery endpoint: serves public key metadata for external verifiers to discover asymmetric signing keys. HMAC secret key material is never exposed; only public JWK and PEM.",
    riskLevel: "MEDIUM",
    mitigations: [
      "Only public key material returned (public_key_jwk, public_key_pem)",
      "HMAC secret key material explicitly excluded per response mapping",
      "Access logged to security telemetry",
    ],
  },
  {
    file: "src/app/api/governance/trust/.well-known/capability-issuer/route.ts",
    purpose: "Capability issuer discovery (.well-known): public endpoint serving trust domain metadata for external verifiers. Analogous to OAuth .well-known/openid-configuration.",
    riskLevel: "MEDIUM",
    mitigations: [
      "No sensitive data returned — only metadata, supported algorithms, and active key IDs",
      "Access logged to security telemetry",
      "Trust domain list reflects current database state",
    ],
  },
  {
    file: "src/lib/workspace-team.ts",
    purpose: "Workspace member invitations: seat snapshot and invitation writes require cross-user access — the invited user may not yet be a member of the workspace, and seat counts aggregate across all current members.",
    riskLevel: "MEDIUM",
    mitigations: [
      "requireGovernancePermission enforced before any privileged operation",
      "requireSeatAvailability gate enforced before invitation write",
      "Duplicate invitation check prevents double-send",
      "actorUserId set in context for audit trail",
    ],
  },
] as const;

export function assertPrivilegedAccessJustified(file: string): void {
  const found = PRIVILEGED_ACCESS_REGISTRY.some((entry) => entry.file === file);
  if (!found) {
    throw new Error(
      `Privileged access is not registered for "${file}". ` +
        `Add an entry to src/lib/security/privileged-access-registry.ts before using service role here.`,
    );
  }
}
