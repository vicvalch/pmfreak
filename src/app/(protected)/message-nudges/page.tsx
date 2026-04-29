import { ModuleShell } from "@/components/pmfreak/module-shell";

export default function MessageNudgesPage() {
  return <ModuleShell title="Smart Message Nudges" subtitle="Generate persona-aware communication options for executives, clients, and delivery teams." metrics={[{ label: "Drafts generated", value: "34" }, { label: "Exec-ready", value: "9" }, { label: "Client-safe tone", value: "92%" }, { label: "Nudge confidence", value: "0.9" }]}><section className="grid gap-3 md:grid-cols-3">{["Executive", "Client", "Delivery Team"].map((aud) => <article key={aud} className="rounded-2xl border border-white/10 bg-black/20 p-4"><h2 className="text-sm font-semibold uppercase text-cyan-300">{aud}</h2><p className="mt-2 text-sm text-slate-300">Suggested message emphasizes risk containment, ownership clarity, and timeline realism.</p></article>)}</section></ModuleShell>;
}
