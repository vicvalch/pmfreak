import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AnalysisRow = { analysis: string };

type ParsedAnalysis = {
  diagnosis: string | null;
  nextMove: string | null;
  communication: string | null;
};

function Card({ children, className = "bg-white" }: { children: ReactNode; className?: string }) {
  return (
    <article className={`rounded-3xl border-2 border-black p-6 shadow-[6px_6px_0_#111] ${className}`}>
      {children}
    </article>
  );
}

function parseAnalysis(analysis: string): ParsedAnalysis {
  const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const extract = (starts: string[], stops: string[]) => {
    const startPattern = starts.map(escapeRegex).join("|");
    const stopPattern = stops.map(escapeRegex).join("|");

    const regex = stopPattern
      ? new RegExp(`(?:${startPattern})\\s*\\n([\\s\\S]*?)(?=\\n\\n(?:${stopPattern})|$)`, "i")
      : new RegExp(`(?:${startPattern})\\s*\\n([\\s\\S]*)$`, "i");

    return analysis.match(regex)?.[1]?.trim() ?? null;
  };

  return {
    diagnosis: extract(["🔴 Execution", "Execution"], ["🟢 Next Move", "Next Move", "💬 Communication", "Communication"]),
    nextMove: extract(["🟢 Next Move", "Next Move"], ["💬 Communication", "Communication"]),
    communication: extract(["💬 Communication", "Communication"], []),
  };
}

function isFreakState(analysis: string) {
  const text = analysis.toLowerCase();
  return ["chaos", "chaotic", "blocked", "critical", "at risk", "stalled", "escalation", "slipping", "risk"].some((word) =>
    text.includes(word),
  );
}

function ErrorState() {
  return (
    <Card className="bg-[#ffe2e2]">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Error</p>
      <p className="mt-2 text-base font-semibold text-black">
        We couldn&apos;t load your execution state right now. Please try again shortly.
      </p>
    </Card>
  );
}

function ActionButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/onboarding" className="inline-flex rounded-full border-2 border-black bg-pink-600 px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0_#111]">
        Run new analysis
      </Link>
      <Link href="/iterate" className="inline-flex rounded-full border-2 border-black bg-white px-6 py-3 text-sm font-black text-black shadow-[4px_4px_0_#111]">
        Update situation
      </Link>
    </div>
  );
}

async function DashboardBody() {
  const supabase = await createSupabaseServerClient();

  const { data: companyId, error: companyError } = await supabase.rpc("current_company_id");

  if (companyError || !companyId) return <ErrorState />;

  const { data: row, error: analysisError } = await supabase
    .from("onboarding_analyses")
    .select("analysis")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<AnalysisRow>();

  if (analysisError) return <ErrorState />;

  if (!row?.analysis) {
    return (
      <Card className="bg-[#fff9ef] text-center">
        <p className="text-lg font-black text-black">No analysis yet. Run your first PMFreak analysis.</p>
        <div className="mt-5 flex justify-center">
          <ActionButtons />
        </div>
      </Card>
    );
  }

  const analysis = row.analysis;
  const parsed = parseAnalysis(analysis);
  const hasParsedSections = Boolean(parsed.diagnosis || parsed.nextMove || parsed.communication);
  const freak = isFreakState(analysis);

  return (
    <div className="space-y-5">
      <Card className="bg-[#f5ead9]">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Execution State</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-base font-semibold text-black/85">
            {freak ? "Your system is currently in a chaotic execution state." : "Your execution is stable but requires attention."}
          </p>
          <span className="w-fit rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-black text-black shadow-[4px_4px_0_#111]">
            {freak ? "Freak 🔴" : "On Track 🟢"}
          </span>
        </div>
      </Card>

      {hasParsedSections ? (
        <section className="grid gap-4 md:grid-cols-2">
          {parsed.diagnosis ? (
            <Card>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Diagnosis</p>
              <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{parsed.diagnosis}</p>
            </Card>
          ) : null}

          {parsed.nextMove ? (
            <Card className="bg-[#fff3fb]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Next Move</p>
              <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{parsed.nextMove}</p>
            </Card>
          ) : null}

          {parsed.communication ? (
            <div className="md:col-span-2">
              <Card className="bg-[#fff7ea]">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Communication</p>
                <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{parsed.communication}</p>
              </Card>
            </div>
          ) : null}
        </section>
      ) : (
        <Card>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">PMFreak analysis</p>
          <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{analysis}</p>
        </Card>
      )}

      <ActionButtons />
    </div>
  );
}

function Loading() {
  return (
    <Card className="bg-[#fff9ef]">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Loading</p>
      <p className="mt-2 text-base font-semibold text-black">Loading your latest PMFreak analysis...</p>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardBody />
    </Suspense>
  );
}
