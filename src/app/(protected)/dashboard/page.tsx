import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AnalysisRecord = {
  analysis: string;
};

type Sections = {
  diagnosis: string | null;
  nextMove: string | null;
  communication: string | null;
};

function Card({ children, className = "bg-white" }: { children: ReactNode; className?: string }) {
  return <article className={`rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0_#111] ${className}`}>{children}</article>;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickSection(text: string, starts: string[], stops: string[]) {
  const start = starts.map(escapeRegex).join("|");
  const stop = stops.map(escapeRegex).join("|");
  const pattern = stop
    ? new RegExp(`(?:${start})\\s*\\n([\\s\\S]*?)(?=\\n\\n(?:${stop})|$)`, "i")
    : new RegExp(`(?:${start})\\s*\\n([\\s\\S]*)$`, "i");
  return text.match(pattern)?.[1]?.trim() ?? null;
}

function parseSections(analysis: string): Sections {
  const diagnosis = pickSection(analysis, ["🔴 Execution", "Execution"], ["🟢 Next Move", "Next Move", "💬 Communication", "Communication"]);
  const nextMove = pickSection(analysis, ["🟢 Next Move", "Next Move"], ["💬 Communication", "Communication"]);
  const communication = pickSection(analysis, ["💬 Communication", "Communication"], []);
  return { diagnosis, nextMove, communication };
}

function isFreakMode(analysis: string) {
  const lowered = analysis.toLowerCase();
  const riskyWords = ["chaos", "chaotic", "critical", "blocked", "escalation", "at risk", "stalled", "slipping"];
  return riskyWords.some((word) => lowered.includes(word));
}

function renderSuccess(analysis: string) {
  const sections = parseSections(analysis);
  const freak = isFreakMode(analysis);
  const hasStructured = Boolean(sections.diagnosis || sections.nextMove || sections.communication);

  const subtitle = freak
    ? "Your system is currently in a chaotic execution state."
    : "Your execution is stable but requires attention.";

  const modeLabel = freak ? "Freak 🔴" : "On Track 🟢";

  return (
    <div className="space-y-5">
      <Card className="bg-[#f5ead9]">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Execution State</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-base font-semibold text-black/85">{subtitle}</p>
          <span className="w-fit rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black text-black shadow-[4px_4px_0_#111]">{modeLabel}</span>
        </div>
      </Card>

      {hasStructured ? (
        <section className="grid gap-4 md:grid-cols-2">
          {sections.diagnosis ? (
            <Card>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Diagnosis</p>
              <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{sections.diagnosis}</p>
            </Card>
          ) : null}

          {sections.nextMove ? (
            <Card className="bg-[#fff3fb]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Next Move</p>
              <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{sections.nextMove}</p>
            </Card>
          ) : null}

          {sections.communication ? (
            <div className="md:col-span-2">
              <Card className="bg-[#fff7ea]">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Communication</p>
                <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{sections.communication}</p>
              </Card>
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

async function DashboardBody() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: companyId, error: companyError } = await supabase.rpc("current_company_id");
    if (companyError) throw companyError;

    const { data: row, error: fetchError } = await supabase
      .from("onboarding_analyses")
      .select("analysis")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<AnalysisRecord>();

    if (fetchError) throw fetchError;

    if (!row?.analysis) {
      return (
        <Card className="bg-[#fff9ef] text-center">
          <p className="text-lg font-black text-black">No analysis yet. Run your first PMFreak analysis.</p>
          <Link href="/onboarding" className="mt-5 inline-flex rounded-full border-2 border-black bg-pink-600 px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[4px_4px_0_#111]">
            Run new analysis
          </Link>
        </Card>
      );
    }

    return renderSuccess(row.analysis);
  } catch {
    return (
      <Card className="bg-[#ffe2e2]">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Error</p>
        <p className="mt-2 text-base font-semibold text-black">We couldn&apos;t load your execution state right now. Please try again shortly.</p>
      </Card>
    );
  }
}

function DashboardLoading() {
  return (
    <Card className="bg-[#fff9ef]">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Loading</p>
      <p className="mt-2 text-base font-semibold text-black">Loading your latest PMFreak analysis...</p>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardBody />
    </Suspense>
  );
}
