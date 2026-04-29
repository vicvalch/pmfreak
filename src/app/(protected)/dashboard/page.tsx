import Link from "next/link";
import { PM_MODULES } from "@/features/navigation/module-registry";

const crossModuleSummary = [
  "Hidden owner detected in security approval chain",
  "Sponsor disengagement risk increased this week",
  "Meeting ended without clear owner for recovery timeline",
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Privana · PMFreak</p>
        <h1 className="mt-3 text-3xl font-semibold">Program Intelligence Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">Monitor stakeholder sentiment, political risk, meeting execution quality, and escalation readiness from one workspace.</p>
      </header>

      <section className="rounded-2xl border border-amber-300/30 bg-amber-950/20 p-5">
        <h2 className="text-lg font-semibold text-amber-100">Cross-module intelligence summary</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-50">
          {crossModuleSummary.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {PM_MODULES.filter((item) => item.href !== "/dashboard").map((item) => (
          <Link key={item.href} href={item.href} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{item.label}</h2>
              <span className="rounded-full border border-cyan-300/30 px-2 py-0.5 text-[10px] uppercase text-cyan-200">{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
