import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const guards = fs.readFileSync('src/lib/security/access-guards.ts', 'utf8');
const rbac = fs.readFileSync('src/lib/security/rbac.ts', 'utf8');
const telemetry = fs.readFileSync('src/lib/security/telemetry.ts', 'utf8');

test('contributor and external stakeholder cannot perform admin/billing actions via centralized governance primitives', () => {
  assert.match(rbac, /contributor:[\s\S]*upload_documents/);
  assert.doesNotMatch(rbac, /contributor:[\s\S]*manage_billing/);
  assert.match(rbac, /external_stakeholder:[\s\S]*new Set\(\["read"\]\)/);
});

test('executive viewer remains read/view only and PM cannot manage billing', () => {
  assert.match(rbac, /executive_viewer:[\s\S]*view_executive/);
  assert.doesNotMatch(rbac, /executive_viewer:[\s\S]*manage_projects[\s\S]*manage_members/);
  assert.match(rbac, /PM:[\s\S]*manage_projects/);
  assert.doesNotMatch(rbac, /PM:[\s\S]*manage_billing/);
});

test('revoked agents and forged scopes are denied through requireAgentScope', () => {
  assert.match(guards, /from\("ai_agent_permissions"\)/);
  assert.match(guards, /\.is\("revoked_at", null\)/);
  assert.match(guards, /agent_scope_denied/);
  assert.match(guards, /requested_permission/);
});

test('role-aware telemetry includes escalation and governance violation events', () => {
  assert.match(telemetry, /suspicious_permission_escalation/);
  assert.match(telemetry, /revoked_agent_access/);
  assert.match(telemetry, /governance_violation/);
  assert.match(guards, /actor_role/);
  assert.match(guards, /denied_permission/);
});
