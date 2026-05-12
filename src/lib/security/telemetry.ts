export type SecurityEventType =
  | "auth_denied"
  | "workspace_scope_violation"
  | "project_scope_violation"
  | "privileged_client_used"
  | "suspicious_cross_scope_attempt"
  | "revoked_membership_attempt"
  | "orphan_access_attempt"
  | "suspicious_permission_escalation"
  | "revoked_agent_access"
  | "governance_violation"
  | "denied_permission";

export function logSecurityEvent(event: SecurityEventType, metadata: Record<string, unknown>) {
  console.warn("[security]", {
    event,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}
