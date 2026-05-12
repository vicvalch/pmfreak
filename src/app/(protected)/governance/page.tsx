import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function GovernancePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("governance_approval_requests").select("*").eq("status", "pending_approval").order("created_at", { ascending: false }).limit(50);
  return <main className="p-6"><h1 className="text-2xl font-semibold">Approval Inbox</h1><div className="space-y-4 mt-4">{(data ?? []).map((r) => <div key={r.id} className="border p-3 rounded"><p><b>{r.action}</b> · {r.risk_level}</p><p>Requester: {r.actor_user_id ?? r.actor_agent_id ?? "n/a"}</p><p>Reason: {r.reason}</p><details><summary>Trace</summary><pre className="text-xs overflow-auto">{JSON.stringify(r.trace, null, 2)}</pre></details><div className="mt-2 flex gap-2"><form action={`/api/governance/approvals/${r.id}/approve`} method="post"><button className="px-2 py-1 bg-green-600 text-white rounded" type="submit">Approve</button></form><form action={`/api/governance/approvals/${r.id}/reject`} method="post"><button className="px-2 py-1 bg-red-600 text-white rounded" type="submit">Reject</button></form></div></div>)}</div></main>;
}
