import { activateContextAction } from "./actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuthUser } from "@/lib/auth";
import { ensureUserWorkspace } from "@/lib/workspaces";
import { CommandCenterClient } from "@/features/command-center/command-center-client";

export default async function CommandCenterPage() {
  const user = await requireAuthUser();
  const workspace = await ensureUserWorkspace(user.id);
  const supabase = await createSupabaseServerClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id,name")
    .eq("workspace_id", workspace.workspaceId)
    .order("created_at", { ascending: false });

  if ((projects ?? []).length === 0) {
    return (
      <div className="space-y-6 pb-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_28px_70px_-40px_rgba(14,116,144,0.45)]">
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-700">PMFreak Activation</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Activate your first operational context</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">PMFreak needs one real initiative to begin sensing execution risk, stakeholder dynamics, meeting debt, and follow-up pressure.</p>

          <form action={activateContextAction} className="mt-7 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-medium">Project / initiative name</span>
              <input required name="name" placeholder="Q3 Enterprise Rollout" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-medium">Customer / sponsor</span>
              <input name="sponsor" placeholder="VP Operations" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-medium">Current phase</span>
              <input name="phase" placeholder="Pilot execution" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-medium">Timeline pressure</span>
              <input name="timeline" placeholder="High - board update in 3 weeks" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span className="font-medium">Top known risk</span>
              <input name="risk" placeholder="Cross-team dependency delays" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span className="font-medium">Key stakeholders</span>
              <input name="stakeholders" placeholder="Ops lead, Finance partner, Vendor PM" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2" />
            </label>
            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span className="font-medium">Description / operational context</span>
              <textarea name="description" rows={6} placeholder="Add initiative context, objectives, constraints, and current pressure points." className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2" />
              <p className="text-xs text-slate-500">Extra setup fields are used to guide your first context and can be refined after activation.</p>
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500">Activate PMFreak Agents</button>
            </div>
          </form>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">What happens next?</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li>1. PMFreak creates your operational context.</li>
              <li>2. Agents begin monitoring risk, meetings, stakeholders, follow-ups, and executive signals.</li>
              <li>3. The Command Center becomes active.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-cyan-50 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-800">Agents standing by</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Execution Risk monitor</li>
              <li>Stakeholder Dynamics monitor</li>
              <li>Meeting Debt monitor</li>
              <li>Follow-up Pressure monitor</li>
            </ul>
          </div>
        </section>
      </div>
    );
  }

  return <CommandCenterClient />;
}
