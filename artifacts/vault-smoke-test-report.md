# Vault Digestive System — Smoke Test Report

**Generated:** 2026-05-20T05:17:03.261Z
**Dataset:** LATAM Enterprise PM — 5 projects across 51 operational artifacts
**Elapsed:** 11ms

## 1. Digestive Overview

| Metric | Value |
|--------|-------|
| Artifacts processed | 51 |
| Nutrients extracted | 410 |
| Residue items | 15 |
| Avg nutrients/artifact | 8.04 |
| Avg residue/artifact | 0.29 |
| Projects analyzed | 5 |

## 2. Top Detected Themes

| Signal Type | Count |
|-------------|-------|
| stakeholder_signal | 113 |
| dependency_signal | 48 |
| blocker_signal | 35 |
| risk_signal | 29 |
| ambiguity_signal | 29 |
| escalation_signal | 28 |
| governance_gap_signal | 23 |
| commitment_signal | 19 |

## 3. Signal Distribution by Project

### proj-mep-14156
- Artifacts: 10 | Nutrients: 87 | Residue: 3
- Top signals: stakeholder_signal(21), governance_gap_signal(11), blocker_signal(8), dependency_signal(8), risk_signal(6)

### proj-ice-9298
- Artifacts: 10 | Nutrients: 73 | Residue: 4
- Top signals: stakeholder_signal(17), financial_impediment_signal(9), escalation_signal(7), blocker_signal(7), dependency_signal(7)

### proj-gch-15992
- Artifacts: 10 | Nutrients: 74 | Residue: 1
- Top signals: stakeholder_signal(20), dependency_signal(12), blocker_signal(6), governance_gap_signal(6), commitment_signal(6)

### proj-hsa-15576
- Artifacts: 10 | Nutrients: 74 | Residue: 3
- Top signals: stakeholder_signal(24), dependency_signal(7), escalation_signal(6), ambiguity_signal(6), blocker_signal(5)

### proj-muc-13098
- Artifacts: 11 | Nutrients: 102 | Residue: 4
- Top signals: stakeholder_signal(31), dependency_signal(14), risk_signal(12), ambiguity_signal(10), blocker_signal(9)

## 4. Residue Analysis

| Residue Category | Count |
|-----------------|-------|
| vague_concern | 4 |
| ambiguous_ownership | 4 |
| unresolved_timeline_reference | 3 |
| possible_risk | 2 |
| incomplete_stakeholder_mention | 2 |

## 5. False Positive Hotspots

- **[mep-001]** possible_over_triggering: 13 nutrients extracted from a single artifact
- **[mep-003]** possible_over_triggering: 13 nutrients extracted from a single artifact
- **[mep-007]** possible_over_triggering: 9 nutrients extracted from a single artifact
- **[mep-009]** possible_over_triggering: 12 nutrients extracted from a single artifact
- **[ice-001]** possible_over_triggering: 9 nutrients extracted from a single artifact
- **[ice-005]** possible_over_triggering: 9 nutrients extracted from a single artifact
- **[ice-007]** possible_over_triggering: 12 nutrients extracted from a single artifact
- **[ice-007]** escalation_spam: 4 escalation signals from one artifact
- **[ice-010]** possible_over_triggering: 10 nutrients extracted from a single artifact
- **[gch-004]** possible_over_triggering: 12 nutrients extracted from a single artifact
- **[gch-004]** escalation_spam: 4 escalation signals from one artifact
- **[gch-010]** possible_over_triggering: 11 nutrients extracted from a single artifact
- **[hsa-002]** possible_over_triggering: 9 nutrients extracted from a single artifact
- **[hsa-002]** escalation_spam: 3 escalation signals from one artifact
- **[hsa-004]** possible_over_triggering: 10 nutrients extracted from a single artifact
- **[hsa-009]** possible_over_triggering: 11 nutrients extracted from a single artifact
- **[hsa-009]** escalation_spam: 3 escalation signals from one artifact
- **[muc-005]** possible_over_triggering: 12 nutrients extracted from a single artifact
- **[muc-005]** escalation_spam: 3 escalation signals from one artifact
- **[muc-006]** possible_over_triggering: 12 nutrients extracted from a single artifact
- **[muc-008]** possible_over_triggering: 9 nutrients extracted from a single artifact
- **[muc-009]** possible_over_triggering: 11 nutrients extracted from a single artifact
- **[muc-010]** possible_over_triggering: 11 nutrients extracted from a single artifact
- **[muc-011]** possible_over_triggering: 11 nutrients extracted from a single artifact

## 6. Missed Signals

No systematic missed signals detected.

## 7. Decay Observations

- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-ice-9298]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-gch-15992]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-hsa-15576]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-muc-13098]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-muc-13098]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-muc-13098]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-muc-13098]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-muc-13098]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-muc-13098]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-muc-13098]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-muc-13098]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-muc-13098]** decayed_actionable: High-severity signal decayed below 50% freshness — may need reinforcement
- **[proj-mep-14156]** recurring_unresolved_blockers: Multiple unresolved high-persistence signals — possible chronic governance gap
- **[proj-ice-9298]** recurring_unresolved_blockers: Multiple unresolved high-persistence signals — possible chronic governance gap
- **[proj-gch-15992]** recurring_unresolved_blockers: Multiple unresolved high-persistence signals — possible chronic governance gap
- **[proj-hsa-15576]** recurring_unresolved_blockers: Multiple unresolved high-persistence signals — possible chronic governance gap
- **[proj-muc-13098]** recurring_unresolved_blockers: Multiple unresolved high-persistence signals — possible chronic governance gap

## 8. Cognitive Readiness Score (Internal)

| Dimension | Score |
|-----------|-------|
| coherence | 100/100 |
| signalQuality | 30/100 |
| noiseSuppression | 0/100 |
| determinism | 100/100 |
| realism | 100/100 |
| explainabilityReadiness | 100/100 |
| persistenceReadiness | 100/100 |
| **OVERALL** | **76/100** |

## 9. Validation Summary

| Check | Result |
|-------|--------|
| Over-trigger flags | ⚠ 24 |
| Under-trigger flags | ✓ None |
| Lineage violations | ✓ None |
| Determinism mismatches | ✓ Pass |
| Signal density flags | ⚠ 2 |
