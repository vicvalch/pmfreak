import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { isFounderOrInternalUser, requireAuthUser } from "@/lib/auth";
import { computeRemainingTrialDays } from "@/lib/early-access";
import { redirect } from "next/navigation";

export default async function EarlyAccessPage() {
  const user = await requireAuthUser();
  if (!isFounderOrInternalUser(user)) redirect("/dashboard");
  const supabase = createSupabaseServiceRoleClient();

  const [{ data: invites }, { data: trials }, { data: activations }] = await Promise.all([
    supabase.from("early_access_invites").select("id, invite_email, invite_note, created_at, accepted_at, expires_at, revoked_at, requires_approval, approved_at").order("created_at", { ascending: false }).limit(20),
    supabase.from("trial_licenses").select("id, trial_status, trial_end_at, workspace_id").order("created_at", { ascending: false }).limit(20),
    supabase.from("workspace_activations").select("workspace_id, activated_at, initialization_status").order("activated_at", { ascending: false }).limit(20),
  ]);

  return <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100 space-y-4">
    <h1 className="text-xl font-semibold">Founder Early Access</h1>
    <p className="text-slate-300">Controlled rollout visibility across invites, 90-day trials, and runtime workspace activation.</p>
    <section>
      <h2 className="font-medium">Active Trials</h2>
      <ul className="mt-2 space-y-1 text-slate-300">{(trials ?? []).filter((t) => t.trial_status === "active").map((trial) => <li key={trial.id}>Workspace {trial.workspace_id} · {computeRemainingTrialDays(trial.trial_end_at)} days remaining <form className="inline" method="post" action="/api/early-access/founder-actions"><input type="hidden" name="action" value="revoke_trial" /><input type="hidden" name="trialId" value={trial.id} /><button className="ml-2 underline" formAction="/api/early-access/founder-actions">Revoke</button></form><form className="inline ml-2" method="post" action="/api/early-access/founder-actions"><input type="hidden" name="action" value="extend_trial" /><input type="hidden" name="trialId" value={trial.id} /><input type="hidden" name="extensionDays" value="7" /><button className="underline">Extend +7d</button></form></li>)}</ul>
    </section>
    <section>
      <h2 className="font-medium">Pending Invites</h2>
      <ul className="mt-2 space-y-2 text-slate-300">{(invites ?? []).filter((invite) => !invite.accepted_at).map((invite) => <li key={invite.id}>{invite.invite_email} · expires {new Date(invite.expires_at).toLocaleDateString()} {invite.invite_note ? `· note: ${invite.invite_note}` : ""} {invite.revoked_at ? "· revoked" : null} {invite.requires_approval && !invite.approved_at ? <form className="inline ml-2" method="post" action="/api/early-access/founder-actions"><input type="hidden" name="action" value="approve_invite" /><input type="hidden" name="inviteId" value={invite.id} /><button className="underline">Approve</button></form> : null}<form className="inline ml-2" method="post" action="/api/early-access/founder-actions"><input type="hidden" name="action" value="revoke_invite" /><input type="hidden" name="inviteId" value={invite.id} /><button className="underline">Revoke</button></form></li>)}</ul>
    </section>
    <section>
      <h2 className="font-medium">Activated Workspaces</h2>
      <ul className="mt-2 space-y-1 text-slate-300">{(activations ?? []).map((activation) => <li key={activation.workspace_id}>{activation.workspace_id} · {activation.initialization_status} · {new Date(activation.activated_at).toLocaleDateString()}</li>)}</ul>
    </section>
  </div>;
}
