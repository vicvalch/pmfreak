import { ModuleShell } from "@/components/pmfreak/module-shell";

export default function MeetingsPage() {
  return <ModuleShell title="Meeting Transcript Analyzer" subtitle="Extract decisions, owners, blockers, and follow-ups from leadership and delivery syncs." metrics={[{ label: "Transcripts processed", value: "12" }, { label: "Decisions extracted", value: "28" }, { label: "Action items", value: "17", delta: "6 due in 48h" }, { label: "Sentiment drift", value: "-0.12", delta: "Escalation tone increasing" }]}><section className="rounded-2xl border border-white/10 bg-black/20 p-5"><h2 className="text-lg font-semibold">Latest Analysis: Steering Committee</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300"><li>Decision: Keep scope freeze through May 15.</li><li>Blocker: Vendor API approval unresolved.</li><li>Owner: Platform Lead to deliver recovery timeline by Friday.</li></ul></section></ModuleShell>;
}
