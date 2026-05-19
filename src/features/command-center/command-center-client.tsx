"use client";

import useSWR from "swr";

type AnyRecord = Record<string, unknown>;
const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed ${url}`);
  return response.json();
};

import { CoordinationQueueCard, InterventionCard, OperationalHealthCard, RecoveryWorkflowCard, RiskCard, StakeholderPressureCard } from "@/features/command-center/widgets";

const FIRST_RUN_ACTIONS = [
  { label: "Add stakeholders", sublabel: "activates political risk sensing" },
  { label: "Paste meeting notes", sublabel: "establishes accountability tracking" },
  { label: "Create your first milestone baseline", sublabel: "anchors delivery confidence telemetry" },
  { label: "Log a follow-up commitment", sublabel: "starts follow-up pressure monitoring" },
];

function FirstRunWelcomePanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-400/[0.08] via-white/[0.02] to-transparent p-6 shadow-[0_16px_50px_-20px_rgba(99,102,241,0.3)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.1),transparent_60%)]" />
      <div className="relative space-y-5">
        <div className="flex items-start gap-3">
          <span className="relative mt-1 flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-400" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-400">
              Operational intelligence active
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-100">
              PMFreak is now monitoring your initiative
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Your first operational context has been activated. The intelligence layer is live — signals
              will populate as you add context below.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-400/15 bg-indigo-400/[0.05] px-4 py-3">
          <div className="flex gap-2">
            <span className="mt-px shrink-0 text-[9px] font-bold uppercase tracking-widest text-indigo-400">AI</span>
            <p className="text-[11px] leading-relaxed text-indigo-200/80">
              PMFreak will begin sensing stakeholder confidence drift once interactions are logged.
              Operational risk telemetry becomes more accurate as meetings are ingested.
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Recommended next actions
          </p>
          <ul className="space-y-2">
            {FIRST_RUN_ACTIONS.map((action) => (
              <li key={action.label} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400/50" />
                <span>
                  {action.label}
                  <span className="ml-1 text-slate-600">— {action.sublabel}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function CommandCenterClient({ firstRun = false }: { firstRun?: boolean }) {
  const swrOptions = { refreshInterval: 20000, revalidateOnFocus: true, dedupingInterval: 3000 };
  const risk = useSWR("/api/intelligence/execution-risk", fetcher, swrOptions);
  const stakeholders = useSWR("/api/intelligence/stakeholders", fetcher, swrOptions);
  const interventions = useSWR("/api/intelligence/interventions", fetcher, swrOptions);
  const coordination = useSWR("/api/intelligence/coordination", fetcher, swrOptions);
  const liveOps = useSWR("/api/intelligence/operational-live", fetcher, swrOptions);

  const loading = [risk, stakeholders, interventions, coordination, liveOps].some((r) => r.isLoading);
  const lastSync = [risk.data?.generatedAt, stakeholders.data?.generatedAt, interventions.data?.generatedAt, coordination.data?.generatedAt, liveOps.data?.generatedAt].filter(Boolean).sort().at(-1);

  const refreshAll = async () => {
    await Promise.all([risk.mutate(), stakeholders.mutate(), interventions.mutate(), coordination.mutate(), liveOps.mutate()]);
  };

  const actions = (coordination.data?.coordination?.operational_priority_queue?.actions ?? coordination.data?.operational_priority_queue?.actions ?? []) as AnyRecord[];
  const commentary = [
    ...(risk.data?.commentary ?? []),
    ...(stakeholders.data?.commentary ?? []),
    ...(interventions.data?.commentary ?? []),
    ...(coordination.data?.coordination?.commentary ?? coordination.data?.commentary ?? []),
  ] as string[];
  const metricCardClass = "rounded-xl border border-white/10 bg-white/20 p-3";

  return (
    <div className="space-y-5 pb-8">
      {firstRun && <FirstRunWelcomePanel />}

      <header className="rounded-3xl border border-white/15 bg-white/90 p-6 shadow-2xl shadow-black/50">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">PMFreak Command Center</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Project Health Overview</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">Live project signals for risks, drift, delivery confidence, and stakeholder pressure.</p>
          </div>
          <button onClick={refreshAll} className="rounded-xl border border-cyan-300/50 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/10">Refresh</button>
        </div>
        <p className="mt-4 text-xs text-slate-400">{loading ? "Refreshing project insights..." : `Last sync: ${lastSync ? new Date(lastSync as string).toLocaleString() : "Awaiting first sync"}`}</p>
      </header>

      <RiskCard title="Executive Risk Banner" level={risk.data?.overallRisk as string}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Execution stability", risk.data?.executionStability],
            ["Escalation probability", interventions.data?.intervention?.escalationProbability ?? interventions.data?.escalationProbability],
            ["Coordination urgency", coordination.data?.coordination?.machineOutput?.coordination_urgency ?? coordination.data?.machineOutput?.coordination_urgency],
            ["Stakeholder volatility", stakeholders.data?.communicationStability],
            ["Delivery confidence", risk.data?.deliveryConfidence],
            ["Intervention severity", interventions.data?.intervention?.interventionUrgency ?? interventions.data?.interventionUrgency],
          ].map(([k, v]) => <div key={k as string} className={metricCardClass}><p className="text-xs text-slate-400">{k as string}</p><p className="mt-1 text-lg font-semibold text-white">{String(v ?? "unknown")}</p></div>)}
        </div>
      </RiskCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <CoordinationQueueCard title="Suggested Actions" level={coordination.data?.coordination_conflict_risk?.level as string}>
          <div className="space-y-3">{actions.slice(0, 5).map((action, idx) => <div key={String(action.actionId ?? idx)} className="rounded-xl border border-white/10 bg-white/25 p-3 text-sm"><p className="font-semibold text-white">#{idx + 1} {String(action.type ?? "action")}</p><p className="text-slate-300">Owner: {String(action.targetStakeholder ?? "unknown")} · Urgency: {String(action.urgency ?? "n/a")} · Timing: {String((action.executionWindow as AnyRecord)?.label ?? "n/a")}</p><p className="mt-1 text-slate-400">Dependency chain: {((action.dependencyChain as AnyRecord[] | undefined) ?? []).map((d) => String(d.reason)).join("; ") || "No blockers"}</p></div>)}</div>
        </CoordinationQueueCard>

        <StakeholderPressureCard title="Stakeholder Pressure Map" level={stakeholders.data?.politicalRisk as string}>
          <div className="space-y-2 text-sm text-slate-200">
            <p>Political risk: <span className="font-semibold">{stakeholders.data?.politicalRisk}</span></p>
            <p>Executive pressure: <span className="font-semibold">{stakeholders.data?.executivePressure}</span></p>
            <p>Escalation trajectory: <span className="font-semibold">{stakeholders.data?.escalationTrajectory}</span></p>
            <p>Communication volatility: <span className="font-semibold">{stakeholders.data?.communicationStability}</span></p>
            <p>Unstable relationships: <span className="font-semibold">{(stakeholders.data?.profiles ?? []).filter((p: AnyRecord) => p.alignmentStatus !== "aligned").length}</span></p>
          </div>
        </StakeholderPressureCard>

        <OperationalHealthCard title="Project Drift Detection" level={interventions.data?.intervention?.operationalDriftSignal?.driftSeverity as string}>
          <ul className="space-y-2 text-sm text-slate-200">
            <li>Blocker accumulation: {String(interventions.data?.intervention?.operationalDriftSignal?.blockerAccumulation ?? "n/a")}</li>
            <li>Execution silence: {String(interventions.data?.intervention?.operationalDriftSignal?.executionSilence ?? "n/a")}</li>
            <li>Unstable cadence: {String(interventions.data?.intervention?.operationalDriftSignal?.unstableCadence ?? "n/a")}</li>
            <li>Overloaded PMs: {String(interventions.data?.intervention?.operationalDriftSignal?.pmOverloadSignal ?? "n/a")}</li>
            <li>Unresolved escalation chains: {String(interventions.data?.intervention?.operationalDriftSignal?.repeatedEscalationWithoutResolution ?? "n/a")}</li>
            <li>Coordination deadlocks: {String(interventions.data?.intervention?.executionDeadlock ?? "n/a")}</li>
          </ul>
        </OperationalHealthCard>

        <RecoveryWorkflowCard title="Recovery Workflow Panel" level={interventions.data?.interventionUrgency as string}>
          <div className="space-y-2 text-sm text-slate-200">
            <p>Stabilization order:</p>
            <ol className="list-decimal pl-5">{(coordination.data?.execution_recovery_path?.sequence ?? coordination.data?.coordination?.execution_recovery_path?.sequence ?? []).map((item: string) => <li key={item}>{item}</li>)}</ol>
            <p>Escalation recommendations: {String(interventions.data?.escalationTarget ?? interventions.data?.intervention?.escalationTarget ?? "none")}</p>
          </div>
        </RecoveryWorkflowCard>
      </div>


      <div className="grid gap-4 xl:grid-cols-2">
        <OperationalHealthCard title="Live Project Activity" level={"elevated"}>
          <div className="space-y-2 text-sm text-slate-200">
            <p>Project mode: <span className="font-semibold">{String(liveOps.data?.mode ?? "offline")}</span></p>
            <p>Timeline events: <span className="font-semibold">{String(liveOps.data?.timeline?.events?.length ?? 0)}</span></p>
            <p>Escalation chain hops: <span className="font-semibold">{String(liveOps.data?.timeline?.escalationChain?.length ?? 0)}</span></p>
            <p>Active pressure recommendations: <span className="font-semibold">{String(liveOps.data?.recommendationQueue?.length ?? 0)}</span></p>
          </div>
        </OperationalHealthCard>
        <InterventionCard title="Why PMFreak Intervened" level={"critical"}>
          <div className="space-y-2 text-sm text-slate-200">
            {(liveOps.data?.whyIntervened ?? []).slice(0, 1).map((item: AnyRecord, idx: number) => (
              <div key={idx} className="rounded-lg border border-white/10 bg-white/20 p-2">
                <p>Rationale: {String(item.coordinationRationale ?? "n/a")}</p>
                <p>Triggering conditions: {((item.triggeringConditions as string[] | undefined) ?? []).join(", ")}</p>
                <p>Recommendation confidence: {String(item.operationalConfidence ?? "n/a")}</p>
              </div>
            ))}
          </div>
        </InterventionCard>
      </div>

      <InterventionCard title="PMFreak Commentary Stream" level={risk.data?.activeEscalationRisk as string}>
        <div className="space-y-2">{commentary.slice(0, 10).map((line, i) => <p key={`${line}-${i}`} className="rounded-lg border border-white/10 bg-white/20 p-2 text-sm text-slate-200">{line}</p>)}</div>
      </InterventionCard>
    </div>
  );
}
