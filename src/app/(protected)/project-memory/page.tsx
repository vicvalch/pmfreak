import { ModuleShell } from "@/components/pmfreak/module-shell";

const events = [
  { date: "2026-04-27", type: "Decision", detail: "Scope freeze enforced through UAT." },
  { date: "2026-04-28", type: "Risk", detail: "Security sign-off delayed due to API review." },
  { date: "2026-04-29", type: "Escalation", detail: "Sponsor notified on integration dependency." },
];

export default function ProjectMemoryPage() {
  return <ModuleShell title="Project Memory" subtitle="Persistent timeline of decisions, risks, escalations, and commitments for rapid context recall." metrics={[{ label: "Events indexed", value: "148" }, { label: "Decisions", value: "44" }, { label: "Escalations", value: "11" }, { label: "Recall confidence", value: "0.93" }]}><section className="rounded-2xl border border-white/10 bg-black/20 p-5"><ol className="space-y-3">{events.map((event) => <li key={event.date + event.type} className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-xs uppercase text-cyan-300">{event.date} · {event.type}</p><p className="mt-1 text-sm text-slate-300">{event.detail}</p></li>)}</ol></section></ModuleShell>;
}
