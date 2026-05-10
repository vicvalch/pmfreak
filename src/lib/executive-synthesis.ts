import { listOperationalMemory, OPERATIONAL_DOMAINS, type OperationalDomain, type OperationalMemoryRecord } from "@/lib/operational-memory";
import { buildExecutiveInterventions, type ExecutiveInterventionRecommendation } from "@/lib/intervention-engine";
import { calculateOperationalTrends, generateExecutiveTimeline, type ExecutiveTimelineEvent, type OperationalTrend } from "@/lib/executive-timeline";
import { computeEscalationLevel, computeOperationalCoherence, computeProjectHealth, type EscalationLevel, type OperationalCoherenceScore, type ProjectHealthScore } from "@/lib/executive-health";

export type OperationalSignal = {
  id: string;
  signalType: "stakeholder_pressure" | "delivery_risk" | "pm_fatigue" | "governance_failure";
  score: number;
  domain: OperationalDomain;
  confidence: number;
};

export type StakeholderPressureSignal = OperationalSignal & { signalType: "stakeholder_pressure" };
export type DeliveryRiskSignal = OperationalSignal & { signalType: "delivery_risk" };
export type PMFatigueSignal = OperationalSignal & { signalType: "pm_fatigue" };
export type GovernanceFailureSignal = OperationalSignal & { signalType: "governance_failure" };

export type EscalationRisk = { level: EscalationLevel; probabilityScore: number; triggers: string[] };

export type ExecutiveInsight = {
  id: string;
  title: string;
  summary: string;
  relatedDomains: OperationalDomain[];
  confidence: number;
};

export type ExecutiveSynthesisSnapshot = {
  generatedAt: string;
  recordsProcessed: number;
  health: ProjectHealthScore;
  coherence: OperationalCoherenceScore;
  escalationRisk: EscalationRisk;
  signals: OperationalSignal[];
  insights: ExecutiveInsight[];
  interventions: ExecutiveInterventionRecommendation[];
  timeline: ExecutiveTimelineEvent[];
  trends: OperationalTrend[];
  weakestDomains: Array<{ domain: OperationalDomain; score: number }>;
  missingInformationWarnings: string[];
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const avg = (items: number[]) => (items.length ? items.reduce((a, b) => a + b, 0) / items.length : 0);

function correlateSignals(records: OperationalMemoryRecord[]): OperationalSignal[] {
  const stakeholder = records.filter((r) => r.domain === "stakeholder_intelligence");
  const delivery = records.filter((r) => r.domain === "delivery_intelligence");
  const team = records.filter((r) => r.domain === "team_health");
  const gov = records.filter((r) => r.domain === "pmo_governance");

  const stakeholderPressure = clamp(avg(stakeholder.map((r) => r.missingFields.length * 8 + (100 - r.confidenceScore) * 0.4)));
  const deliveryRisk = clamp(avg(delivery.map((r) => (100 - r.confidenceScore) * 0.7 + (100 - r.completionScore) * 0.3)));
  const pmFatigue = clamp(avg(team.map((r) => r.missingFields.length * 7 + (100 - r.confidenceScore) * 0.45)));
  const governanceFailure = clamp(avg(gov.map((r) => (100 - r.completionScore) * 0.8 + r.missingFields.length * 3)));

  const signals: OperationalSignal[] = [
    { id: "stakeholder-pressure", signalType: "stakeholder_pressure", score: stakeholderPressure, domain: "stakeholder_intelligence", confidence: 80 },
    { id: "delivery-risk", signalType: "delivery_risk", score: deliveryRisk, domain: "delivery_intelligence", confidence: 84 },
    { id: "pm-fatigue", signalType: "pm_fatigue", score: pmFatigue, domain: "team_health", confidence: 74 },
    { id: "governance-failure", signalType: "governance_failure", score: governanceFailure, domain: "pmo_governance", confidence: 88 },
  ];

  return signals.filter((s) => s.score > 0);
}

function buildInsights(signals: OperationalSignal[], escalation: EscalationRisk): ExecutiveInsight[] {
  const insights: ExecutiveInsight[] = [];
  const byType = new Map(signals.map((signal) => [signal.signalType, signal] as const));
  const stakeholder = byType.get("stakeholder_pressure");
  const delivery = byType.get("delivery_risk");
  const governance = byType.get("governance_failure");
  const fatigue = byType.get("pm_fatigue");

  if (stakeholder && delivery && governance && stakeholder.score >= 55 && delivery.score >= 55 && governance.score >= 50) {
    insights.push({
      id: "cross-domain-escalation-cluster",
      title: "Escalation cluster detected",
      summary: "Stakeholder pressure and delivery risk are rising while governance completeness is degraded.",
      relatedDomains: ["stakeholder_intelligence", "delivery_intelligence", "pmo_governance"],
      confidence: clamp((stakeholder.score + delivery.score + governance.score) / 3),
    });
  }

  if (fatigue && stakeholder && fatigue.score >= 55 && stakeholder.score >= 55) {
    insights.push({
      id: "pm-overload-risk",
      title: "PM overload risk",
      summary: "PM fatigue and stakeholder pressure indicate coordination burden is increasing.",
      relatedDomains: ["team_health", "stakeholder_intelligence"],
      confidence: clamp((fatigue.score + stakeholder.score) / 2),
    });
  }

  if (!insights.length) {
    insights.push({
      id: "stable-state",
      title: "Operational state within normal thresholds",
      summary: "No multi-domain pattern breached escalation thresholds.",
      relatedDomains: ["operational_memory"],
      confidence: 72,
    });
  }

  if (escalation.level === "critical") {
    insights.push({
      id: "critical-escalation",
      title: "Escalation probability crossed critical threshold",
      summary: "Cross-domain operational degradation requires executive intervention prioritization.",
      relatedDomains: ["executive_context", "risk_intelligence", "delivery_intelligence"],
      confidence: Math.max(82, escalation.probabilityScore),
    });
  }

  return insights;
}

export async function buildExecutiveSynthesis(companyId: string, projectId: string | null): Promise<ExecutiveSynthesisSnapshot> {
  const records = await listOperationalMemory(companyId, projectId);
  const health = computeProjectHealth(records);
  const coherence = computeOperationalCoherence(records);
  const signals = correlateSignals(records);

  const stakeholderPressure = signals.find((s) => s.signalType === "stakeholder_pressure")?.score ?? 0;
  const deliveryRisk = signals.find((s) => s.signalType === "delivery_risk")?.score ?? 0;
  const pmFatigue = signals.find((s) => s.signalType === "pm_fatigue")?.score ?? 0;
  const governanceFailure = signals.find((s) => s.signalType === "governance_failure")?.score ?? 0;

  const hasGovernanceGap = governanceFailure >= 55;
  const level = computeEscalationLevel({ health, coherence, hasGovernanceGap, stakeholderPressure, deliveryRisk });
  const probabilityScore = clamp((100 - health.overall) * 0.45 + (100 - coherence.overall) * 0.2 + stakeholderPressure * 0.2 + deliveryRisk * 0.15);
  const escalationRisk: EscalationRisk = {
    level,
    probabilityScore,
    triggers: [
      stakeholderPressure >= 55 ? "stakeholder pressure rising" : "",
      deliveryRisk >= 55 ? "delivery confidence declining" : "",
      hasGovernanceGap ? "missing governance artifacts" : "",
    ].filter(Boolean),
  };

  const interventions = buildExecutiveInterventions({ escalationLevel: level, stakeholderPressure, deliveryRisk, pmFatigue, governanceGap: hasGovernanceGap });
  const timeline = generateExecutiveTimeline(records);
  const trends = calculateOperationalTrends(records);
  const insights = buildInsights(signals, escalationRisk);

  const weakestDomains = OPERATIONAL_DOMAINS.map((domain) => {
    const domainRecords = records.filter((record) => record.domain === domain);
    const score = domainRecords.length ? avg(domainRecords.map((record) => (record.completionScore + record.confidenceScore) / 2)) : 0;
    return { domain, score: clamp(score) };
  }).sort((a, b) => a.score - b.score).slice(0, 3);

  const missingInformationWarnings = OPERATIONAL_DOMAINS.flatMap((domain) => {
    const found = records.filter((record) => record.domain === domain);
    if (!found.length) return [`Missing domain coverage: ${domain}`];
    if (avg(found.map((record) => record.completionScore)) < 45) return [`Low completion in ${domain}`];
    return [];
  });

  return {
    generatedAt: new Date().toISOString(),
    recordsProcessed: records.length,
    health,
    coherence,
    escalationRisk,
    signals,
    insights,
    interventions,
    timeline,
    trends,
    weakestDomains,
    missingInformationWarnings,
  };
}
