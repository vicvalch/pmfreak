import { requireAuthUser } from "@/lib/auth";

const roleSummary: Record<string, string> = {
  admin: "Admins can manage tenant settings and all project memory.",
  pm: "PMs can upload and analyze project scope documents.",
  viewer: "Viewers can review dashboards and portfolio history.",
};

export default async function ProjectsPage() {
  const user = await requireAuthUser();

  return (
    <main className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10">
      <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Projects</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Project workspace</h1>
      <p className="mt-2 text-sm text-slate-300">{roleSummary[user.role]}</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
        This page is protected, tenant-aware, and role-aware as part of Sprint 7 architecture.
      </div>
    </main>
  );
}
