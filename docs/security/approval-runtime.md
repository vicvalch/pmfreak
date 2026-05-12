# Approval Runtime (Phase 5.1)

## Enforced now
- Governance decisions can resolve as allow/deny/require_human_approval/require_admin_approval/require_additional_scope.
- Approval-required decisions persist to `governance_approval_requests`.
- Lifecycle statuses tracked: evaluated, pending_approval, approved, rejected, expired, cancelled, executed_after_approval.
- Telemetry events emitted for request/approve/reject plus execution lifecycle hooks.

## Prepared, not fully enforced
- Single-execution tokening for post-approval action execution is partially prepared and requires route-by-route integration.
- Expiration handling exists in approval APIs; scheduled expiration worker is future work.

## Not implemented
- Multi-step workflow orchestration.
- External AOC protocol interoperability.
- Enterprise GRC controls.
