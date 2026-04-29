import { ModuleShell } from "@/components/pmfreak/module-shell";

const stakeholders = [
  { name: "CFO Sponsor", influence: "High", stance: "Supportive", risk: "Low" },
  { name: "Security Lead", influence: "High", stance: "Neutral", risk: "Medium" },
  { name: "Ops Director", influence: "Medium", stance: "Concerned", risk: "High" },
];

export default function StakeholderIntelPage() {
  return <ModuleShell title="Stakeholder Intelligence" subtitle="Relationship heatmap for key project actors with influence and volatility indicators." metrics={[{ label: "At-risk stakeholders", value: "2", delta: "+1 this week" }, { label: "Alignment score", value: "74%", delta: "Needs sponsor reinforcement" }, { label: "Touchpoints overdue", value: "3", delta: "Focus on Ops + Security" }, { label: "Confidence", value: "0.86", delta: "Based on recent interactions" }]}><section className="grid gap-4 md:grid-cols-3">{stakeholders.map((s) => <article key={s.name} className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-lg font-semibold">{s.name}</p><p className="mt-2 text-sm text-slate-300">Influence: {s.influence}</p><p className="text-sm text-slate-300">Stance: {s.stance}</p><p className="text-sm text-slate-300">Relationship Risk: {s.risk}</p></article>)}</section></ModuleShell>;
}
