import { requireAuthUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuthUser();

  return (
    <main className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10">
      <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Dashboard</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Welcome, {user.fullName}</h1>
      <p className="mt-2 text-sm text-slate-300">Company tenant: {user.companyName}</p>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="text-sm font-semibold text-cyan-200">Auth</h2>
          <p className="mt-2 text-sm text-slate-300">Supabase session active.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="text-sm font-semibold text-cyan-200">Tenant</h2>
          <p className="mt-2 text-sm text-slate-300">All project memory is scoped to your company ID.</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="text-sm font-semibold text-cyan-200">Role</h2>
          <p className="mt-2 text-sm text-slate-300">Current role: {user.role}</p>
        </article>
      </section>
    </main>
  );
}
