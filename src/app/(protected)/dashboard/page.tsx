import Link from "next/link";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AnalysisRecord = {
  analysis: string;
};

function Card({ title, content }: { title: string; content: string }) {
  return (
    <article className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#111]">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">{title}</p>
      <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{content}</p>
    </article>
  );
}

function parse(text: string) {
  const diagnosis = text.match(/🔴.*?\n([\s\S]*?)(?=\n\n|$)/)?.[1]?.trim();
  const nextMove = text.match(/🟢.*?\n([\s\S]*?)(?=\n\n|$)/)?.[1]?.trim();
  const communication = text.match(/💬.*?\n([\s\S]*?)(?=\n\n|$)/)?.[1]?.trim();

  return { diagnosis, nextMove, communication };
}

function isFreak(text: string) {
  const t = text.toLowerCase();
  return ["chaos", "blocked", "critical", "slipping", "risk"].some((w) => t.includes(w));
}

async function DashboardContent() {
  const supabase = await createSupabaseServerClient();

  const { data: companyId, error: companyError } = await supabase.rpc("current_company_id");

  if (companyError || !companyId) {
    return (
      <Card
        title="Error"
        content="We couldn't load your company context right now. Please try again shortly."
      />
    );
  }

  const { data, error } = await supabase
    .from("onboarding_analyses")
    .select("analysis")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<AnalysisRecord>();

  if (error) {
    return (
      <Card
        title="Error"
        content="We couldn't load your execution state right now. Please try again shortly."
      />
    );
  }

  if (!data?.analysis) {
    return (
      <section className="rounded-3xl border-2 border-black bg-[#fff9ef] p-8 text-center shadow-[6px_6px_0_#111]">
        <p className="text-lg font-black text-black">No analysis yet.</p>
        <p className="mt-2 text-sm font-medium text-black/70">Run your first PMFreak analysis to initialize your execution state.</p>
        <Link href="/onboarding" className="mt-5 inline-flex rounded-full border-2 border-black bg-pink-600 px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0_#111]">
          Run analysis
        </Link>
      </section>
    );
  }

  const parsed = parse(data.analysis);
  const freak = isFreak(data.analysis);
  const hasStructured = parsed.diagnosis || parsed.nextMove || parsed.communication;

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border-2 border-black bg-[#f5ead9] p-6 shadow-[6px_6px_0_#111]">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Execution State</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-base font-semibold text-black/85">
            {freak
              ? "Your system is currently in a chaotic execution state."
              : "Your execution is stable but requires attention."}
          </p>
          <span className="w-fit rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black text-black shadow-[4px_4px_0_#111]">
            {freak ? "Freak 🔴" : "On Track 🟢"}
          </span>
        </div>
      </section>

      {hasStructured ? (
        <section className="grid gap-4 md:grid-cols-2">
          {parsed.diagnosis ? <Card title="Diagnosis" content={parsed.diagnosis} /> : null}
          {parsed.nextMove ? <Card title="Next Move" content={parsed.nextMove} /> : null}
          {parsed.communication ? (
            <div className="md:col-span-2">
              <Card title="Communication" content={parsed.communication} />
            </div>
          ) : null}
        </section>
      ) : (
        <Card title="PMFreak analysis" content={data.analysis} />
      )}

      <Link href="/onboarding" className="inline-flex rounded-full border-2 border-black bg-pink-600 px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0_#111]">
        Run new analysis
      </Link>
    </div>
  );
}

function Loading() {
  return (
    <Card
      title="Loading"
      content="Loading your latest PMFreak analysis..."
    />
  );
}

export default function DashboardPage() {
  return (
    <div className="p-8">
      <Suspense fallback={<Loading />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
