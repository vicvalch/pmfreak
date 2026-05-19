"use client";

import useSWR from "swr";
import { useRouter } from "next/navigation";

type AnyRecord = Record<string, unknown>;
type UserProject = { id: string; name: string };

// Typed fetch error so callers can distinguish 401/403 from network failures.
class IntelligenceFetchError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "IntelligenceFetchError";
  }
}

const fetcher = async ([url, projectId, workspaceId]: [string, string, string]) => {
  const params = new URLSearchParams({ projectId });
  if (workspaceId) params.set("workspaceId", workspaceId);
  const response = await fetch(`${url}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new IntelligenceFetchError(`Failed ${url}`, response.status);
  return response.json();
};

const isAuthError = (err: unknown) =>
  err instanceof IntelligenceFetchError && (err.status === 401 || err.status === 403);

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

function EndpointErrorBadge({ error }: { error: unknown }) {
  if (!error) return null;
  if (isAuthError(error)) {
    return <p className="mt-1 text-[10px] text-rose-400">Authorization error — project access denied.</p>;
  }
  return <p className="mt-1 text-[10px] text-amber-400">Intelligence unavailable — service error.</p>;
}

export function CommandCenterClient({
  firstRun = false,
  projectId,
  projectName,
  workspaceId,
  projects,
}: {
  firstRun?: boolean;
  projectId: string;
  projectName: string;
  workspaceId: string;
  projects: UserProject[];
}) {
  const router = useRouter();
  const swrOptions = { refreshInterval: 20000, revalidateOnFocus: true, dedupingInterval: 3000 };
  // 3-tuple key: [url, projectId, workspaceId] — scopes SWR cache across all three dimensions.
  // Changing any dimension invalidates stale data and triggers a new fetch.
  const key = (path: string): [string, string, string] => [path, projectId, workspaceId];

  const risk = useSWR(key("/api/intelligence/execution-risk"), fetcher, swrOptions);
  const stakeholders = useSWR(key("/api/intelligence/stakeholders"), fetcher, swrOptions);
  const interventions = useSWR(key("/api/intelligence/interventions"), fetcher, swrOptions);
  const coordination = useSWR(key("/api/intelligence/coordination"), fetcher, swrOptions);
  const liveOps = useSWR(key("/api/intelligence/operational-live"), fetcher, swrOptions);

  const allEndpoints = [risk, stakeholders, interventions, coordination, liveOps];
  const loading = allEndpoints.some((r) => r.isLoading);
  const anyAuthError = allEndpoints.some((r) => isAuthError(r.error));
  const lastSync = allEndpoints
    .map((r) => r.data?.generatedAt as string | undefined)
    .filter(Boolean)
    .sort()
    .at(-1);

  const refreshAll = () =>
    Promise.all(allEndpoints.map((r) => r.mutate()));

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    if (newId && newId !== projectId) {
      router.push(`/command-center?projectId=${encodeURIComponent(newId)}`);
    }
  };

  if (anyAuthError) {
    return (
      <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.05] p-6">
        <p className="text-sm font-semibold text-rose-200">Intelligence access denied</p>
        <p className="mt-1 text-xs text-slate-400">
          One or more intelligence endpoints rejected the project scope. This may indicate a
          session expiry or a workspace membership change. Refresh or return to the project list.
        </p>
        <a
          href="/command-center"
          className="mt-3 inline-block rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-400/15"
        >
          Return to Command Center
        </a>
      </div>
    );
  }

  const actions = (coordination.data?.coordination?.operational_priority_queue?.actions ?? coordination.data?.operational_priority_queue?.actions ?? []) as AnyRecord[];
  const commentary = [
    ...(risk.data?.commentary ?? []),
    ...(stakeholders.data?.commentary ?? []),
    ...(interventions.data?.commentary ?? []),
    ...(coordination.data?.coordination?.commentary ?? coordination.data?.commentary ?? []),
  ] as string[];
  const metricCardClass = "rounded-xl border border-white/10 bg-white/20 p-3";

  // Render a metric value, distinguishing loading / error / no data from actual data.
  const metricValue = (endpoint: typeof risk, value: unknown) => {
    if (endpoint.isLoading) return "—";
    if (endpoint.error) return isAuthError(endpoint.error) ? "access denied" : "unavailable";
    if (value === undefined || value === null) return "no data";
    return String(value);
  };

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
          <div className="flex items-center gap-3">
            {projects.length > 1 && (
              <select
                value={projectId}
                onChange={handleProjectChange}
                className="rounded-lg border border-white/20 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                aria-label="Switch project"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
            {projects.length === 1 && (
              <span className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-400">{projectName}</span>
            )}
            <button onClick={refreshAll} className="rounded-xl border border-cyan-300/50 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/10">Refresh</button>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400">{loading ? "Refreshing project insights..." : `Last sync: ${lastSync ? new Date(lastSync).toLocaleString() : "Awaiting first sync"}`}</p>
      </header>

      <RiskCard title="Executive Risk Banner" level={risk.data?.overallRisk as string}>
        {risk.error && <EndpointErrorBadge error={risk.error} />}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Execution stability", metricValue(risk, risk.data?.executionStability)],
            ["Escalation probability", metricValue(interventions, interventions.data?.intervention?.escalationProbability ?? interventions.data?.escalationProbability)],
            ["Coordination urgency", metricValue(coordination, coordination.data?.coordination?.machineOutput?.coordination_urgency ?? coordination.data?.machineOutput?.coordination_urgency)],
            ["Stakeholder volatility", metricValue(stakeholders, stakeholders.data?.communicationStability)],
            ["Delivery confidence", metricValue(risk, risk.data?.deliveryConfidence)],
            ["Intervention severity", metricValue(interventions, interventions.data?.intervention?.interventionUrgency ?? interventions.data?.interventionUrgency)],
          ].map(([k, v]) => (
            <div key={k as string} className={metricCardClass}>
              <p className="text-xs text-slate-400">{k as string}</p>
              <p className="mt-1 text-lg font-semibold text-white">{v as string}</p>
            </div>
          ))}
        </div>
      </RiskCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <CoordinationQueueCard title="Suggested Actions" level={coordination.data?.coordination_conflict_risk?.level as string}>
          {coordination.error && <EndpointErrorBadge error={coordination.error} />}
          {!coordination.error && !coordination.isLoading && actions.length === 0 && (
            <p className="text-sm text-slate-500">No coordinated actions yet — intelligence is accumulating.</p>
          )}
          <div className="space-y-3">{actions.slice(0, 5).map((action, idx) => <div key={String(action.actionId ?? idx)} className="rounded-xl border border-white/10 bg-white/25 p-3 text-sm"><p className="font-semibold text-white">#{idx + 1} {String(action.type ?? "action")}</p><p className="text-slate-300">Owner: {String(action.targetStakeholder ?? "unknown")} · Urgency: {String(action.urgency ?? "n/a")} · Timing: {String((action.executionWindow as AnyRecord)?.label ?? "n/a")}</p><p className="mt-1 text-slate-400">Dependency chain: {((action.dependencyChain as AnyRecord[] | undefined) ?? []).map((d) => String(d.reason)).join("; ") || "No blockers"}</p></div>)}</div>
        </CoordinationQueueCard>

        <StakeholderPressureCard title="Stakeholder Pressure Map" level={stakeholders.data?.politicalRisk as string}>
          {stakeholders.error && <EndpointErrorBadge error={stakeholders.error} />}
          {!stakeholders.error && (
            <div className="space-y-2 text-sm text-slate-200">
              <p>Political risk: <span className="font-semibold">{metricValue(stakeholders, stakeholders.data?.politicalRisk)}</span></p>
              <p>Executive pressure: <span className="font-semibold">{metricValue(stakeholders, stakeholders.data?.executivePressure)}</span></p>
              <p>Escalation trajectory: <span className="font-semibold">{metricValue(stakeholders, stakeholders.data?.escalationTrajectory)}</span></p>
              <p>Communication volatility: <span className="font-semibold">{metricValue(stakeholders, stakeholders.data?.communicationStability)}</span></p>
              <p>Unstable relationships: <span className="font-semibold">{stakeholders.isLoading ? "—" : String((stakeholders.data?.profiles ?? []).filter((p: AnyRecord) => p.alignmentStatus !== "aligned").length)}</span></p>
            </div>
          )}
        </StakeholderPressureCard>

        <OperationalHealthCard title="Project Drift Detection" level={interventions.data?.intervention?.operationalDriftSignal?.driftSeverity as string}>
          {interventions.error && <EndpointErrorBadge error={interventions.error} />}
          {!interventions.error && (
            <ul className="space-y-2 text-sm text-slate-200">
              <li>Blocker accumulation: {metricValue(interventions, interventions.data?.intervention?.operationalDriftSignal?.blockerAccumulation)}</li>
              <li>Execution silence: {metricValue(interventions, interventions.data?.intervention?.operationalDriftSignal?.executionSilence)}</li>
              <li>Unstable cadence: {metricValue(interventions, interventions.data?.intervention?.operationalDriftSignal?.unstableCadence)}</li>
              <li>Overloaded PMs: {metricValue(interventions, interventions.data?.intervention?.operationalDriftSignal?.pmOverloadSignal)}</li>
              <li>Unresolved escalation chains: {metricValue(interventions, interventions.data?.intervention?.operationalDriftSignal?.repeatedEscalationWithoutResolution)}</li>
              <li>Coordination deadlocks: {metricValue(interventions, interventions.data?.intervention?.executionDeadlock)}</li>
            </ul>
          )}
        </OperationalHealthCard>

        <RecoveryWorkflowCard title="Recovery Workflow Panel" level={interventions.data?.interventionUrgency as string}>
          {interventions.error && <EndpointErrorBadge error={interventions.error} />}
          {!interventions.error && (
            <div className="space-y-2 text-sm text-slate-200">
              <p>Stabilization order:</p>
              <ol className="list-decimal pl-5">{(coordination.data?.execution_recovery_path?.sequence ?? coordination.data?.coordination?.execution_recovery_path?.sequence ?? []).map((item: string) => <li key={item}>{item}</li>)}</ol>
              <p>Escalation recommendations: {metricValue(interventions, interventions.data?.escalationTarget ?? interventions.data?.intervention?.escalationTarget)}</p>
            </div>
          )}
        </RecoveryWorkflowCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <OperationalHealthCard title="Live Project Activity" level={"elevated"}>
          {liveOps.error && <EndpointErrorBadge error={liveOps.error} />}
          {!liveOps.error && (
            <div className="space-y-2 text-sm text-slate-200">
              <p>Project mode: <span className="font-semibold">{metricValue(liveOps, liveOps.data?.mode)}</span></p>
              <p>Timeline events: <span className="font-semibold">{liveOps.isLoading ? "—" : String(liveOps.data?.timeline?.events?.length ?? 0)}</span></p>
              <p>Escalation chain hops: <span className="font-semibold">{liveOps.isLoading ? "—" : String(liveOps.data?.timeline?.escalationChain?.length ?? 0)}</span></p>
              <p>Active pressure recommendations: <span className="font-semibold">{liveOps.isLoading ? "—" : String(liveOps.data?.recommendationQueue?.length ?? 0)}</span></p>
            </div>
          )}
        </OperationalHealthCard>
        <InterventionCard title="Why PMFreak Intervened" level={"critical"}>
          {liveOps.error && <EndpointErrorBadge error={liveOps.error} />}
          {!liveOps.error && (
            <div className="space-y-2 text-sm text-slate-200">
              {(liveOps.data?.whyIntervened ?? []).slice(0, 1).map((item: AnyRecord, idx: number) => (
                <div key={idx} className="rounded-lg border border-white/10 bg-white/20 p-2">
                  <p>Rationale: {String(item.coordinationRationale ?? "n/a")}</p>
                  <p>Triggering conditions: {((item.triggeringConditions as string[] | undefined) ?? []).join(", ")}</p>
                  <p>Recommendation confidence: {String(item.operationalConfidence ?? "n/a")}</p>
                </div>
              ))}
              {!liveOps.isLoading && (liveOps.data?.whyIntervened ?? []).length === 0 && (
                <p className="text-sm text-slate-500">No intervention triggers detected yet.</p>
              )}
            </div>
          )}
        </InterventionCard>
      </div>

      <InterventionCard title="PMFreak Commentary Stream" level={risk.data?.activeEscalationRisk as string}>
        {!loading && commentary.length === 0 && !risk.error && (
          <p className="text-sm text-slate-500">No commentary yet — intelligence is accumulating for this project.</p>
        )}
        <div className="space-y-2">{commentary.slice(0, 10).map((line, i) => <p key={`${line}-${i}`} className="rounded-lg border border-white/10 bg-white/20 p-2 text-sm text-slate-200">{line}</p>)}</div>
      </InterventionCard>
    </div>
  );
}
