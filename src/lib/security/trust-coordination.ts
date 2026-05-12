import { createHmac, createHash, createPrivateKey, createPublicKey, randomUUID, sign, verify } from "node:crypto";
import { createPrivilegedSupabaseClient } from "@/lib/security/privileged-access";
import { resolvePublicVerificationKey, resolveVerificationKey } from "@/lib/security/trust-domains";
import { logSecurityEvent } from "@/lib/security/telemetry";

export type TrustEventType = "trust_domain_suspended" | "trust_domain_revoked" | "signing_key_revoked" | "signing_key_rotated" | "capability_claim_revoked" | "delegation_revoked" | "issuer_distrusted" | "verifier_policy_revoked";
export type TrustSeverity = "info" | "warning" | "critical";
export type RevocationReason = "claim_revoked" | "key_revoked" | "trust_domain_revoked" | "delegation_revoked" | "grant_revoked" | "verifier_policy_revoked" | "issuer_distrusted" | null;

export function hashTrustEvent(event: Record<string, unknown>) { const canonical = JSON.stringify(event, Object.keys(event).sort()); return createHash("sha256").update(canonical).digest("hex"); }

export function createTrustEvent(input: any) {
  const event = { id: randomUUID(), event_id: input.eventId ?? `te_${Date.now()}`, event_type: input.eventType, issuer_app: input.issuerApp, trust_domain: input.trustDomain, key_id: input.keyId ?? null, claim_hash: input.claimHash ?? null, delegation_id: input.delegationId ?? null, grant_id: input.grantId ?? null, workspace_id: input.workspaceId ?? null, source_verifier: input.sourceVerifier ?? null, severity: input.severity ?? "warning", reason: input.reason ?? null, event_payload: input.eventPayload ?? {}, signature: null, created_at: input.createdAt ?? new Date().toISOString(), expires_at: input.expiresAt ?? null, propagated_at: input.propagatedAt ?? null };
  void logSecurityEvent("trust_event_created", { workspaceId: event.workspace_id, metadata: { eventId: event.event_id, eventType: event.event_type, trustDomain: event.trust_domain, severity: event.severity } });
  return event;
}

export function signTrustEvent(event: any, input: { algorithm: "Ed25519" | "HMAC-SHA256"; keyId: string; secretRef?: string; hmacSecret?: string }) {
  const unsigned = { ...event, signature: undefined };
  const payload = `${input.keyId}.${hashTrustEvent(unsigned)}`;
  const signature = input.algorithm === "Ed25519"
    ? sign(null, Buffer.from(payload), createPrivateKey(process.env[input.secretRef ?? ""] ?? "")).toString("base64url")
    : createHmac("sha256", input.hmacSecret ?? process.env.PMFREAK_TRUST_EVENT_HMAC_SECRET ?? "").update(payload).digest("base64url");
  void logSecurityEvent("trust_event_signed", { workspaceId: event.workspace_id ?? null, metadata: { eventId: event.event_id, algorithm: input.algorithm, keyId: input.keyId } });
  return { ...event, signature, signature_key_id: input.keyId, signature_algorithm: input.algorithm };
}

export async function verifyTrustEvent(event: any, options: { trustedSources?: string[]; allowHmacFallback?: boolean } = {}) {
  if (options.trustedSources?.length && event.source_verifier && !options.trustedSources.includes(event.source_verifier)) { await logSecurityEvent("trust_event_rejected", { workspaceId: event.workspace_id ?? null, metadata: { eventId: event.event_id, reason: "untrusted_source" } }); return { ok: false, reason: "untrusted_source" }; }
  const unsigned = { ...event, signature: undefined };
  const payload = `${event.signature_key_id}.${hashTrustEvent(unsigned)}`;
  let ok = false;
  if (event.signature_algorithm === "Ed25519") {
    const key = event.key_id ? await resolveVerificationKey({ trustDomainId: event.trust_domain_id ?? "", keyId: event.signature_key_id }) : null;
    const verifier = key ? resolvePublicVerificationKey(key) : (event.public_key_pem ? createPublicKey(event.public_key_pem) : null);
    ok = verifier ? verify(null, Buffer.from(payload), verifier, Buffer.from(event.signature, "base64url")) : false;
  } else if (event.signature_algorithm === "HMAC-SHA256" && options.allowHmacFallback) {
    const expected = createHmac("sha256", process.env.PMFREAK_TRUST_EVENT_HMAC_SECRET ?? "").update(payload).digest("base64url");
    ok = expected === event.signature;
  }
  await logSecurityEvent(ok ? "trust_event_verified" : "trust_event_rejected", { workspaceId: event.workspace_id ?? null, metadata: { eventId: event.event_id, reason: ok ? "verified" : "signature_invalid" } });
  return { ok, reason: ok ? "verified" : "signature_invalid" };
}

export function explainTrustEvent(event: any) { return { eventId: event.event_id, eventType: event.event_type, trustDomain: event.trust_domain, severity: event.severity, reason: event.reason ?? null, signed: !!event.signature, propagated: !!event.propagated_at }; }

export async function registerRevocationFromEvent(event: any) {
  const revocationType = event.event_type === "capability_claim_revoked" ? "claim" : event.event_type === "signing_key_revoked" ? "key" : event.event_type === "trust_domain_revoked" ? "trust_domain" : event.event_type === "delegation_revoked" ? "delegation" : event.event_type === "verifier_policy_revoked" ? "verifier_policy" : event.event_type === "issuer_distrusted" ? "trust_domain" : null;
  if (!revocationType) return null;
  const supabase = createPrivilegedSupabaseClient({ routeId: "security.trust_coordination", operation: "register_revocation", reason: "trust_event_ingest" });
  const { data, error } = await supabase.from("capability_revocation_registry").insert({ revocation_type: revocationType, trust_domain: event.trust_domain, key_id: event.key_id ?? null, claim_hash: event.claim_hash ?? null, delegation_id: event.delegation_id ?? null, grant_id: event.grant_id ?? null, revoked_by: event.issuer_app ?? null, reason: event.reason ?? null, severity: event.severity, expires_at: event.expires_at ?? null, source_event_id: event.event_id }).select("*").single();
  if (error) throw error;
  await logSecurityEvent("revocation_registered", { workspaceId: event.workspace_id ?? null, metadata: { sourceEventId: event.event_id, revocationType } });
  return data;
}

export async function getRevocationReason(input: { trustDomain: string; keyId?: string; claimHash?: string; delegationId?: string; grantId?: string }) : Promise<RevocationReason> {
  const supabase = createPrivilegedSupabaseClient({ routeId: "security.trust_coordination", operation: "check_revocation", reason: "verify_capability_claim" });
  const { data } = await supabase.from("capability_revocation_registry").select("*").eq("trust_domain", input.trustDomain);
  const active = (data ?? []).filter((r: any) => !r.expires_at || new Date(r.expires_at).getTime() > Date.now());
  if (active.some((r: any) => r.revocation_type === "trust_domain")) return "trust_domain_revoked";
  if (input.keyId && active.some((r: any) => r.revocation_type === "key" && r.key_id === input.keyId)) return "key_revoked";
  if (input.claimHash && active.some((r: any) => r.revocation_type === "claim" && r.claim_hash === input.claimHash)) return "claim_revoked";
  if (input.delegationId && active.some((r: any) => r.revocation_type === "delegation" && r.delegation_id === input.delegationId)) return "delegation_revoked";
  if (input.grantId && active.some((r: any) => r.revocation_type === "grant" && r.grant_id === input.grantId)) return "grant_revoked";
  if (active.some((r: any) => r.revocation_type === "verifier_policy")) return "verifier_policy_revoked";
  return null;
}

export async function upsertTrustGraphEdge(input: any) { const supabase = createPrivilegedSupabaseClient({ routeId: "security.trust_coordination", operation: "upsert_trust_graph_edge", reason: "trust_graph_update" }); const now = new Date().toISOString(); const { data, error } = await supabase.from("capability_trust_graph_edges").upsert({ source_domain: input.sourceDomain, target_domain: input.targetDomain, relationship: input.relationship, scope: input.scope ?? {}, status: input.status ?? "active", created_at: input.createdAt ?? now, updated_at: now }, { onConflict: "source_domain,target_domain,relationship" }).select("*").single(); if (error) throw error; await logSecurityEvent(input.status === "revoked" ? "trust_graph_edge_revoked" : "trust_graph_edge_created", { metadata: { sourceDomain: input.sourceDomain, targetDomain: input.targetDomain, relationship: input.relationship, status: input.status ?? "active" } }); return data; }
export async function getTrustGraphForDomain(domain: string) { const supabase = createPrivilegedSupabaseClient({ routeId: "security.trust_coordination", operation: "get_trust_graph", reason: "trust_graph_read" }); const { data } = await supabase.from("capability_trust_graph_edges").select("*").or(`source_domain.eq.${domain},target_domain.eq.${domain}`); return data ?? []; }
export async function explainTrustGraphPath(input: { sourceDomain: string; targetDomain: string }) { const edges = await getTrustGraphForDomain(input.sourceDomain); const direct = edges.find((e: any) => e.target_domain === input.targetDomain); return direct ? { connected: true, relationship: direct.relationship, status: direct.status } : { connected: false, relationship: null, status: "unknown" }; }
