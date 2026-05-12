import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime = fs.readFileSync('src/lib/security/governance-runtime.ts', 'utf8');
const apiList = fs.readFileSync('src/app/api/governance/approvals/route.ts', 'utf8');
const apiApprove = fs.readFileSync('src/app/api/governance/approvals/[id]/approve/route.ts', 'utf8');

test('approval decisions and lifecycle fields exist', () => {
  assert.match(runtime, /require_human_approval/);
  assert.match(runtime, /pending_approval/);
  assert.match(runtime, /requiredApprovalType/);
});

test('deterministic approval rules are codified', () => {
  assert.match(runtime, /input.action === "ai.execute"/);
  assert.match(runtime, /input.action === "document.upload"/);
  assert.match(runtime, /input.action === "billing.manage"/);
  assert.match(runtime, /input.action === "privileged.use"/);
});

test('approval api exists with approve restrictions', () => {
  assert.match(apiList, /export async function GET/);
  assert.match(apiApprove, /Already resolved/);
  assert.match(apiApprove, /Expired/);
});
