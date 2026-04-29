import { ModuleShell } from "@/components/pmfreak/module-shell";

export default function PoliticalRiskPage() {
  return <ModuleShell title="Political Risk Alerts" subtitle="Detect organizational friction patterns that may derail execution and sponsorship." metrics={[{ label: "Open risk alerts", value: "5" }, { label: "Critical", value: "1", delta: "Cross-functional ownership dispute" }, { label: "Escalation likelihood", value: "68%" }, { label: "Alert confidence", value: "0.81" }]}><section className="space-y-3">{["CFO + Operations mismatch on milestone readiness", "Security governance concerns not reflected in RAID log", "Delivery team signaling scope ambiguity in standups"].map((item) => <article key={item} className="rounded-2xl border border-rose-300/30 bg-rose-950/20 p-4 text-sm text-rose-100">{item}</article>)}</section></ModuleShell>;
}
