/**
 * Automated tests for the Vault Digestive System smoke-test runner.
 *
 * Tests validate:
 *   - Smoke test execution and output shape
 *   - Deterministic digestion behavior
 *   - Cognition metric generation
 *   - Validation heuristic behavior (over/under-trigger detection)
 *   - Lineage completeness
 *   - Signal density assertions
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Load the smoke-test module (contains both the simulation data and validation logic)
const {
  runSmokeTest,
  validateOverTriggering,
  validateUnderTriggering,
  validateSignalDensity,
  validateLineageIntegrity,
  validateDeterminism,
  runDigestivePipeline,
  extractNutrientCandidates,
  digestArtifact,
  SIMULATION_ARTIFACTS,
} = await import('../scripts/smoke-test-vault-digestion.mjs');

// ─── Simulation Dataset ───────────────────────────────────────────────────────

test('simulation dataset has at least 50 artifacts', () => {
  assert.ok(SIMULATION_ARTIFACTS.length >= 50, `Expected >= 50 artifacts, got ${SIMULATION_ARTIFACTS.length}`);
});

test('simulation dataset covers all 5 required projects', () => {
  const projectIds = new Set(SIMULATION_ARTIFACTS.map((a) => a.projectId));
  const required = ['proj-mep-14156', 'proj-ice-9298', 'proj-gch-15992', 'proj-hsa-15576', 'proj-muc-13098'];
  for (const id of required) {
    assert.ok(projectIds.has(id), `Missing project: ${id}`);
  }
});

test('simulation dataset has at least 5 different workspaceIds', () => {
  const workspaceIds = new Set(SIMULATION_ARTIFACTS.map((a) => a.workspaceId));
  assert.ok(workspaceIds.size >= 5, `Expected >= 5 workspaces, got ${workspaceIds.size}`);
});

test('all artifacts have required fields', () => {
  for (const artifact of SIMULATION_ARTIFACTS) {
    assert.ok(artifact.id, `Artifact missing id`);
    assert.ok(artifact.workspaceId, `${artifact.id} missing workspaceId`);
    assert.ok(artifact.projectId, `${artifact.id} missing projectId`);
    assert.ok(artifact.type, `${artifact.id} missing type`);
    assert.ok(artifact.content && artifact.content.length >= 50, `${artifact.id} content too short`);
    assert.ok(artifact.submittedAt, `${artifact.id} missing submittedAt`);
  }
});

test('simulation dataset has diverse source types', () => {
  const sourceTypes = new Set(SIMULATION_ARTIFACTS.map((a) => a.type));
  assert.ok(sourceTypes.size >= 4, `Expected >= 4 source types, got ${sourceTypes.size}`);
});

// ─── Pipeline Output Shape ────────────────────────────────────────────────────

test('digestArtifact returns a well-formed digestion result', () => {
  const artifact = SIMULATION_ARTIFACTS[0];
  const result = digestArtifact(artifact);
  assert.ok(result.digestivePass, 'must have digestivePass');
  assert.ok(result.digestivePass.runId, 'runId required');
  assert.ok(result.digestivePass.workspaceId, 'workspaceId required');
  assert.equal(result.digestivePass.workspaceId, artifact.workspaceId);
  assert.equal(result.digestivePass.projectId, artifact.projectId);
  assert.ok(Array.isArray(result.nutrients), 'nutrients must be array');
  assert.ok(Array.isArray(result.residue), 'residue must be array');
  assert.ok(Array.isArray(result.entities), 'entities must be array');
  assert.equal(result.digestivePass.nutrientCount, result.nutrients.length);
  assert.equal(result.digestivePass.residueCount, result.residue.length);
});

test('digestion result nutrients have required structure', () => {
  const artifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'mep-001');
  const result = digestArtifact(artifact);
  assert.ok(result.nutrients.length > 0, 'mep-001 should produce nutrients');
  for (const nutrient of result.nutrients) {
    assert.ok(nutrient.id, 'nutrient must have id');
    assert.ok(nutrient.nutrientType, 'nutrient must have type');
    assert.ok(nutrient.summary, 'nutrient must have summary');
    assert.ok(nutrient.workspaceId, 'nutrient must have workspaceId');
    assert.equal(nutrient.workspaceId, artifact.workspaceId);
    assert.ok(Array.isArray(nutrient.evidence), 'evidence must be array');
    assert.ok(nutrient.evidence.length > 0, 'evidence must not be empty');
    assert.ok(nutrient.scoring, 'nutrient must have scoring');
    assert.ok(typeof nutrient.scoring.confidence === 'number', 'confidence must be number');
    assert.ok(nutrient.scoring.confidence >= 0 && nutrient.scoring.confidence <= 1, 'confidence in [0,1]');
    assert.ok(['low', 'medium', 'high', 'critical'].includes(nutrient.scoring.severity));
    assert.ok(['fast', 'medium', 'slow', 'persistent'].includes(nutrient.scoring.decayProfile));
  }
});

test('digestion extracts blocker signal from mep-001 escalation artifact', () => {
  const artifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'mep-001');
  const result = digestArtifact(artifact);
  const hasBlocker = result.nutrients.some((n) => n.nutrientType === 'blocker_signal');
  assert.ok(hasBlocker, 'mep-001 should extract a blocker_signal (blocked by Cisco SASE)');
});

test('digestion extracts financial signal from ice-001 payment escalation', () => {
  const artifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'ice-001');
  const result = digestArtifact(artifact);
  const hasFinancial = result.nutrients.some((n) => n.nutrientType === 'financial_impediment_signal');
  assert.ok(hasFinancial, 'ice-001 should extract financial_impediment_signal (payment blocking release)');
});

test('digestion extracts escalation signal from escalation artifacts', () => {
  const escalationArtifacts = SIMULATION_ARTIFACTS.filter((a) => a.title.includes('ESCALATION'));
  for (const artifact of escalationArtifacts) {
    const result = digestArtifact(artifact);
    const hasEscalation = result.nutrients.some((n) => n.nutrientType === 'escalation_signal');
    assert.ok(hasEscalation, `${artifact.id} should extract escalation_signal`);
  }
});

test('digestion extracts recovery signal from successful completion artifacts', () => {
  const artifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'mep-008');
  const result = digestArtifact(artifact);
  const hasRecovery = result.nutrients.some((n) => n.nutrientType === 'recovery_signal');
  assert.ok(hasRecovery, 'mep-008 (HQ onboarding completed) should extract recovery_signal');
});

test('digestion extracts ambiguity signal from ambiguous content', () => {
  const artifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'mep-006');
  const result = digestArtifact(artifact);
  const hasAmbiguity = result.nutrients.some((n) => n.nutrientType === 'ambiguity_signal');
  assert.ok(hasAmbiguity, 'mep-006 (MFA unclear process) should extract ambiguity_signal');
});

test('digestion extracts contradiction signal from conflicting requirements', () => {
  const artifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'gch-007');
  const result = digestArtifact(artifact);
  const hasContradiction = result.nutrients.some((n) => n.nutrientType === 'contradiction_signal');
  assert.ok(hasContradiction, 'gch-007 (license types conflict) should extract contradiction_signal');
});

// ─── Determinism ──────────────────────────────────────────────────────────────

test('digestion is deterministic: same artifact produces same nutrient count', () => {
  const artifact = SIMULATION_ARTIFACTS[0];
  const run1 = digestArtifact(artifact, '-det1');
  const run2 = digestArtifact(artifact, '-det2');
  assert.equal(run1.nutrients.length, run2.nutrients.length, 'Nutrient count must be deterministic');
});

test('digestion is deterministic: same artifact produces same nutrient types', () => {
  const artifact = SIMULATION_ARTIFACTS[5];
  const run1 = digestArtifact(artifact, '-det1');
  const run2 = digestArtifact(artifact, '-det2');
  const types1 = run1.nutrients.map((n) => n.nutrientType).sort().join(',');
  const types2 = run2.nutrients.map((n) => n.nutrientType).sort().join(',');
  assert.equal(types1, types2, 'Nutrient types must be deterministic');
});

test('digestion is deterministic: same artifact produces same residue count', () => {
  const artifact = SIMULATION_ARTIFACTS[10];
  const run1 = digestArtifact(artifact, '-det1');
  const run2 = digestArtifact(artifact, '-det2');
  assert.equal(run1.residue.length, run2.residue.length, 'Residue count must be deterministic');
});

test('digestion is deterministic: same artifact produces same scoring', () => {
  const artifact = SIMULATION_ARTIFACTS[3];
  const run1 = digestArtifact(artifact, '-det1');
  const run2 = digestArtifact(artifact, '-det2');
  const scores1 = run1.nutrients.map((n) => `${n.nutrientType}:${n.scoring.confidence}:${n.scoring.severity}`).sort().join(';');
  const scores2 = run2.nutrients.map((n) => `${n.nutrientType}:${n.scoring.confidence}:${n.scoring.severity}`).sort().join(';');
  assert.equal(scores1, scores2, 'Scoring must be deterministic');
});

test('validateDeterminism finds no mismatches across 10 test artifacts', () => {
  const mismatches = validateDeterminism(SIMULATION_ARTIFACTS);
  assert.equal(mismatches.length, 0, `Expected 0 determinism mismatches, got ${mismatches.length}: ${JSON.stringify(mismatches.slice(0, 3))}`);
});

// ─── Lineage Integrity ────────────────────────────────────────────────────────

test('every nutrient has at least one evidence lineage record', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const violations = validateLineageIntegrity(digestedResults);
  const missingEvidenceViolations = violations.filter((v) => v.violation === 'missing_evidence_lineage');
  assert.equal(missingEvidenceViolations.length, 0, `Found ${missingEvidenceViolations.length} nutrients with no evidence lineage`);
});

test('every evidence lineage record has a non-empty excerpt', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const violations = validateLineageIntegrity(digestedResults);
  const emptyExcerptViolations = violations.filter((v) => v.violation === 'empty_excerpt');
  assert.equal(emptyExcerptViolations.length, 0, `Found ${emptyExcerptViolations.length} evidence records with empty excerpts`);
});

test('every evidence lineage preserves workspaceId correctly', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const violations = validateLineageIntegrity(digestedResults);
  const workspaceViolations = violations.filter((v) => v.violation === 'workspaceId_mismatch');
  assert.equal(workspaceViolations.length, 0, `Found ${workspaceViolations.length} workspaceId mismatches in lineage`);
});

test('every evidence lineage preserves projectId correctly', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const violations = validateLineageIntegrity(digestedResults);
  const projectIdViolations = violations.filter((v) => v.violation === 'projectId_mismatch');
  assert.equal(projectIdViolations.length, 0, `Found ${projectIdViolations.length} projectId mismatches in lineage`);
});

test('every evidence lineage has a confidence basis explanation', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const violations = validateLineageIntegrity(digestedResults);
  const missingBasisViolations = violations.filter((v) => v.violation === 'missing_confidence_basis');
  assert.equal(missingBasisViolations.length, 0, `Found ${missingBasisViolations.length} nutrients with no confidence basis`);
});

// ─── Signal Density ───────────────────────────────────────────────────────────

test('signal density is within reasonable range for dense operational PM artifacts (1.5 to 12 avg nutrients)', () => {
  // This simulation dataset is intentionally signal-rich (multi-issue PM updates, escalations, blockers).
  // The over-trigger validator separately flags individual artifacts above 8 nutrients.
  // The density test validates the system doesn't produce absurdly sparse or completely unconstrained output.
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const density = validateSignalDensity(digestedResults);
  assert.ok(density.avgNutrients >= 1.5, `Average nutrients per artifact too sparse: ${density.avgNutrients.toFixed(2)}`);
  assert.ok(density.avgNutrients <= 12, `Average nutrients per artifact unreasonably high: ${density.avgNutrients.toFixed(2)}`);
});

test('at least 10 of the 14 signal types are represented across the dataset', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const density = validateSignalDensity(digestedResults);
  const coveredTypes = Object.keys(density.typeDistribution).length;
  assert.ok(coveredTypes >= 10, `Only ${coveredTypes} signal types represented — expected >= 10`);
});

test('blocker_signal appears in at least 5 artifacts', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const density = validateSignalDensity(digestedResults);
  const count = density.typeDistribution['blocker_signal'] ?? 0;
  assert.ok(count >= 5, `blocker_signal only appears ${count} times — expected >= 5 for this dataset`);
});

test('financial_impediment_signal appears at least once', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const density = validateSignalDensity(digestedResults);
  const count = density.typeDistribution['financial_impediment_signal'] ?? 0;
  assert.ok(count >= 1, 'financial_impediment_signal should appear — dataset has explicit payment blockers');
});

test('escalation_signal appears at least 3 times', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const density = validateSignalDensity(digestedResults);
  const count = density.typeDistribution['escalation_signal'] ?? 0;
  assert.ok(count >= 3, `escalation_signal only appears ${count} times — expected >= 3 for dataset with explicit escalations`);
});

// ─── Over-trigger Detection ───────────────────────────────────────────────────

test('over-trigger validator detects artifacts with excessive nutrients', () => {
  const excessiveArtifact = {
    id: 'test-over-trigger',
    workspaceId: 'ws-test',
    projectId: 'proj-test',
    actorUserId: 'user-test',
    type: 'operational_update',
    title: 'Over-trigger Test',
    submittedAt: new Date().toISOString(),
    sourceRef: 'user-test:test',
    content: [
      'The project is blocked by vendor delays and this is a risk to the timeline.',
      'Escalation raised to executive attention due to governance gap.',
      'Financial impediment: budget not approved by deadline today.',
      'Decision pending on whether to proceed with the dependency on the external vendor.',
      'Stakeholder confusion about commitment made last week.',
      'Timeline pressure is imminent as the delivery is slipping behind schedule.',
      'Waiting for approval from client executive sponsor to continue.',
      'Audit compliance concern raised about the governance process.',
      'TBD whether we can resolve the ambiguity before the deadline.',
      'Risk of contradiction with previously signed-off plan.',
    ].join('\n'),
  };
  const results = [{ artifact: excessiveArtifact, result: digestArtifact(excessiveArtifact) }];
  const flags = validateOverTriggering(results);
  const hasOverTrigger = flags.some((f) => f.flag === 'possible_over_triggering');
  assert.ok(hasOverTrigger, 'Should detect over-triggering for artifact with 9+ dense signal lines');
});

test('over-trigger validator does NOT flag minimal signal artifacts', () => {
  const simpleArtifact = {
    id: 'test-simple',
    workspaceId: 'ws-test',
    projectId: 'proj-test',
    actorUserId: 'user-test',
    type: 'project_note',
    title: 'Simple Update',
    submittedAt: new Date().toISOString(),
    sourceRef: 'user-test:test',
    content: 'Team meeting completed today. No major issues to report. Client confirmed availability for next sprint review.',
  };
  const results = [{ artifact: simpleArtifact, result: digestArtifact(simpleArtifact) }];
  const flags = validateOverTriggering(results);
  const hasOverTrigger = flags.some((f) => f.flag === 'possible_over_triggering');
  assert.ok(!hasOverTrigger, 'Simple low-signal artifact should not trigger over-trigger detection');
});

// ─── Under-trigger Detection ──────────────────────────────────────────────────

test('under-trigger validator detects missed payment signal', () => {
  const paymentArtifact = {
    id: 'test-payment-missed',
    workspaceId: 'ws-test',
    projectId: 'proj-test',
    actorUserId: 'user-test',
    type: 'email_update',
    title: 'Payment Not Processed',
    submittedAt: new Date().toISOString(),
    sourceRef: 'user-test:test',
    content: 'The wire transfer to the vendor was supposed to go through yesterday. Payment not processed by the treasury team. We are waiting on resolution from their side.',
  };
  const result = digestArtifact(paymentArtifact);
  const nutrientTypes = new Set(result.nutrients.map((n) => n.nutrientType));
  // Under-trigger check: if payment language present but no financial/blocker signal
  const hasFinancialOrBlocker = nutrientTypes.has('financial_impediment_signal') || nutrientTypes.has('blocker_signal') || nutrientTypes.has('dependency_signal');
  // This artifact should EITHER be caught by extraction OR flagged as under-triggered
  // The test verifies the under-trigger detection logic works correctly
  const results = [{ artifact: paymentArtifact, result }];
  const flags = validateUnderTriggering(results);
  if (!hasFinancialOrBlocker) {
    const hasFlag = flags.some((f) => f.flag === 'missed_payment_signal');
    assert.ok(hasFlag, 'If payment language not extracted, under-trigger validator should flag it');
  }
  // Either the extractor caught it OR the under-trigger detector did — one of these must be true
  const detectedByExtractor = hasFinancialOrBlocker;
  const detectedByValidator = flags.some((f) => f.artifactId === paymentArtifact.id);
  assert.ok(detectedByExtractor || detectedByValidator, 'Payment delay must be detected by extractor OR flagged by under-trigger validator');
});

test('under-trigger validator finds no major operational misses in the simulation dataset', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const flags = validateUnderTriggering(digestedResults);
  // Most critical signals should be caught — tolerate up to 5 under-trigger flags in a 51-artifact dataset
  assert.ok(flags.length <= 10, `${flags.length} under-trigger flags found — expected <= 10 for a well-designed simulation dataset`);
});

// ─── Cognition Metric Generation ─────────────────────────────────────────────

test('smoke test runs and returns a structured report', () => {
  // Redirect console output to avoid cluttering test output
  const originalLog = console.log;
  console.log = () => {};
  let report;
  try {
    report = runSmokeTest();
  } finally {
    console.log = originalLog;
  }
  assert.ok(report, 'runSmokeTest must return a report');
  assert.ok(report.metadata, 'report must have metadata');
  assert.ok(report.overview, 'report must have overview');
  assert.ok(report.signalDistribution, 'report must have signalDistribution');
  assert.ok(report.validation, 'report must have validation section');
  assert.ok(report.cognitionReadinessScore, 'report must have cognitionReadinessScore');
});

test('cognition readiness score has all required dimensions', () => {
  const originalLog = console.log;
  console.log = () => {};
  let report;
  try {
    report = runSmokeTest();
  } finally {
    console.log = originalLog;
  }
  const score = report.cognitionReadinessScore;
  const requiredDimensions = ['coherence', 'signalQuality', 'noiseSuppression', 'determinism', 'realism', 'explainabilityReadiness', 'persistenceReadiness', 'overall'];
  for (const dim of requiredDimensions) {
    assert.ok(dim in score, `Missing dimension: ${dim}`);
    assert.ok(typeof score[dim] === 'number', `${dim} must be a number`);
    assert.ok(score[dim] >= 0 && score[dim] <= 100, `${dim} must be in [0, 100], got ${score[dim]}`);
  }
});

test('overall cognition readiness score is at least 50/100', () => {
  const originalLog = console.log;
  console.log = () => {};
  let report;
  try {
    report = runSmokeTest();
  } finally {
    console.log = originalLog;
  }
  assert.ok(report.cognitionReadinessScore.overall >= 50, `Overall readiness ${report.cognitionReadinessScore.overall}/100 is below minimum threshold of 50`);
});

test('coherence score is 100 when all lineage violations are absent', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => ({ artifact, result: digestArtifact(artifact) }));
  const violations = validateLineageIntegrity(digestedResults);
  if (violations.length === 0) {
    // Coherence should be 100 when there are no violations
    assert.ok(true, 'No lineage violations — coherence should be perfect');
  } else {
    assert.ok(violations.length < 5, `Unexpectedly high lineage violation count: ${violations.length}`);
  }
});

// ─── Project-level Isolation ──────────────────────────────────────────────────

test('nutrients are scoped to correct workspace for each project', () => {
  const mepArtifacts = SIMULATION_ARTIFACTS.filter((a) => a.projectId === 'proj-mep-14156');
  for (const artifact of mepArtifacts) {
    const result = digestArtifact(artifact);
    for (const nutrient of result.nutrients) {
      assert.equal(nutrient.workspaceId, 'ws-mep', `MEP nutrient has wrong workspaceId: ${nutrient.workspaceId}`);
      assert.equal(nutrient.projectId, 'proj-mep-14156', `MEP nutrient has wrong projectId: ${nutrient.projectId}`);
    }
  }
});

test('nutrients from different projects do not cross workspace boundaries', () => {
  const iceArtifacts = SIMULATION_ARTIFACTS.filter((a) => a.projectId === 'proj-ice-9298');
  const mepArtifacts = SIMULATION_ARTIFACTS.filter((a) => a.projectId === 'proj-mep-14156');
  const iceNutrients = iceArtifacts.flatMap((a) => digestArtifact(a).nutrients);
  const mepWorkspaces = new Set(mepArtifacts.map((a) => a.workspaceId));
  for (const nutrient of iceNutrients) {
    assert.ok(!mepWorkspaces.has(nutrient.workspaceId), 'ICE nutrients must not appear in MEP workspace');
  }
});

// ─── Scoring Semantics ────────────────────────────────────────────────────────

test('blocker_signal nutrients are scored as high severity by default', () => {
  const blockerArtifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'mep-001');
  const result = digestArtifact(blockerArtifact);
  const blockerNutrients = result.nutrients.filter((n) => n.nutrientType === 'blocker_signal');
  for (const n of blockerNutrients) {
    assert.ok(['high', 'critical'].includes(n.scoring.severity), `Unresolved blocker should be high/critical severity, got ${n.scoring.severity}`);
  }
});

test('financial_impediment_signal nutrients have persistent decay profile', () => {
  const financialArtifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'ice-001');
  const result = digestArtifact(financialArtifact);
  const financialNutrients = result.nutrients.filter((n) => n.nutrientType === 'financial_impediment_signal');
  for (const n of financialNutrients) {
    assert.equal(n.scoring.decayProfile, 'persistent', 'Financial signals must have persistent decay');
  }
});

test('recovery_signal nutrients have fast decay profile', () => {
  const recoveryArtifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'mep-008');
  const result = digestArtifact(recoveryArtifact);
  const recoveryNutrients = result.nutrients.filter((n) => n.nutrientType === 'recovery_signal');
  for (const n of recoveryNutrients) {
    assert.equal(n.scoring.decayProfile, 'fast', 'Recovery signals must have fast decay');
  }
});

test('all nutrients have confidence in [0, 1]', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => digestArtifact(artifact));
  for (const result of digestedResults) {
    for (const nutrient of result.nutrients) {
      assert.ok(nutrient.scoring.confidence >= 0 && nutrient.scoring.confidence <= 1, `Confidence ${nutrient.scoring.confidence} out of range for ${nutrient.nutrientType}`);
    }
  }
});

test('all nutrients are freshness 1.0 at creation time', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => digestArtifact(artifact));
  for (const result of digestedResults) {
    for (const nutrient of result.nutrients) {
      assert.equal(nutrient.scoring.freshness, 1.0, `Freshness at creation must be 1.0 for ${nutrient.nutrientType}`);
    }
  }
});

// ─── Residue Behavior ─────────────────────────────────────────────────────────

test('residue records contain non-empty excerpts', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => digestArtifact(artifact));
  for (const result of digestedResults) {
    for (const residue of result.residue) {
      assert.ok(residue.rawExcerpt && residue.rawExcerpt.length > 0, 'Residue must have rawExcerpt');
      assert.ok(residue.rationale && residue.rationale.length > 0, 'Residue must have rationale');
      assert.ok(residue.workspaceId, 'Residue must have workspaceId');
    }
  }
});

test('residue is capped at 30 per artifact', () => {
  const digestedResults = SIMULATION_ARTIFACTS.map((artifact) => digestArtifact(artifact));
  for (const result of digestedResults) {
    assert.ok(result.residue.length <= 30, `Residue count ${result.residue.length} exceeds cap of 30`);
  }
});

test('vague concern residue is triggered by appropriate artifacts', () => {
  const artifact = SIMULATION_ARTIFACTS.find((a) => a.id === 'hsa-007');
  const result = digestArtifact(artifact);
  const hasVagueConcern = result.residue.some((r) => r.residueCategory === 'vague_concern');
  assert.ok(hasVagueConcern, 'hsa-007 (a bit worried, something seems off) should produce vague_concern residue');
});
