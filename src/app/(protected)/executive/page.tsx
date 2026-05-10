import { ExecutiveDashboard } from "@/components/pmfreak/executive/executive-dashboard";
import { getAuthUser } from "@/lib/auth";
import { buildExecutiveSynthesis } from "@/lib/executive-synthesis";

export default async function ExecutivePage() {
  const user = await getAuthUser();
  if (!user) return null;
  const snapshot = await buildExecutiveSynthesis(user.companyId, null);

  return (
    <main className="space-y-6 pb-8">
      <header className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">PMFreak Executive Layer</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Executive Operational Intelligence</h1>
        <p className="mt-2 text-sm text-slate-300">Deterministic cross-domain synthesis for intervention and escalation governance.</p>
      </header>
      <ExecutiveDashboard snapshot={snapshot} />
    </main>
  );
}
