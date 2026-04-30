"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type BrainResponse = {
  final?: string;
  error?: string;
};

const roles = ["Founder", "Project Manager", "Operations Lead", "Executive", "Other"];
const projectTypes = ["Software projects", "Client implementations", "Internal operations", "PMO portfolio", "Other"];

export default function OnboardingPage() {
  const [workspace, setWorkspace] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalResponse, setFinalResponse] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [persistenceWarning, setPersistenceWarning] = useState<string | null>(null);

  const canSubmit = workspace.trim() && problem.trim() && !loading;

  const parsedResponse = useMemo(() => {
    if (!finalResponse) return null;

    const diagnosis = finalResponse.match(/🔴\s*Execution\s*\n([\s\S]*?)(?=\n\n💬\s*Communication|$)/)?.[1]?.trim();
    const communication = finalResponse.match(/💬\s*Communication\s*\n([\s\S]*)$/)?.[1]?.trim();

    return {
      diagnosis,
      communication,
      hasStructured: Boolean(diagnosis || communication),
    };
  }, [finalResponse]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setFinalResponse("");
    setIsInitialized(false);
    setPersistenceWarning(null);

    try {
      const userInput = `Company/workspace: ${workspace}\nRole: ${role}\nProject type: ${projectType}\nCurrent execution problem: ${problem}`;

      const response = await fetch("/api/ai/pmfreak-brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });

      const data = (await response.json()) as BrainResponse;

      if (!response.ok) {
        throw new Error(data.error || "PMFreak analysis failed. Please try again.");
      }

      const analysis = data.final || "PMFreak returned no analysis. Please retry.";
      setFinalResponse(analysis);

      try {
        const persistenceResponse = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspace,
            role,
            projectType,
            problem,
            analysis,
            source: "onboarding",
            createdAt: new Date().toISOString(),
          }),
        });

        if (!persistenceResponse.ok) {
          setPersistenceWarning("Analysis completed, but we could not save it yet.");
          return;
        }

        setIsInitialized(true);
      } catch {
        setPersistenceWarning("Analysis completed, but we could not save it yet.");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border-2 border-black bg-[#f5ead9] p-6 shadow-[8px_8px_0_#111] md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-pink-700">PMFreak onboarding</p>
            <h1 className="mt-3 text-3xl font-black text-black md:text-4xl">Welcome to PMFreak.</h1>
            <p className="mt-2 text-lg font-semibold text-black/85">Let&apos;s understand the chaos before we fix it.</p>
          </div>
          <div className="w-fit rounded-2xl border-2 border-black bg-[#fff7ea] p-3 shadow-[5px_5px_0_#111]">
            <Image src="/Cara.png" alt="PMFreak mascot" width={90} height={90} className="h-auto w-[70px] md:w-[90px]" priority />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border-2 border-black bg-[#fff9ef] p-6 shadow-[8px_8px_0_#111] md:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="workspace" className="text-sm font-black uppercase tracking-[0.08em] text-black">Workspace / company name</label>
            <input id="workspace" value={workspace} onChange={(event) => setWorkspace(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-pink-500" placeholder="Example: Acme Delivery Ops" required />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="role" className="text-sm font-black uppercase tracking-[0.08em] text-black">Your role</label>
              <select id="role" value={role} onChange={(event) => setRole(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 font-semibold text-black outline-none focus:ring-2 focus:ring-pink-500">
                {roles.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="projectType" className="text-sm font-black uppercase tracking-[0.08em] text-black">What are you managing?</label>
              <select id="projectType" value={projectType} onChange={(event) => setProjectType(event.target.value)} className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 font-semibold text-black outline-none focus:ring-2 focus:ring-pink-500">
                {projectTypes.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="problem" className="text-sm font-black uppercase tracking-[0.08em] text-black">What is going wrong?</label>
            <textarea id="problem" value={problem} onChange={(event) => setProblem(event.target.value)} rows={6} className="mt-2 w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-black outline-none focus:ring-2 focus:ring-pink-500" placeholder="Example: deadlines are slipping, owners are unclear, and client updates are getting risky." required />
          </div>

          <button type="submit" disabled={!canSubmit} className="inline-flex rounded-full border-2 border-black bg-pink-600 px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[4px_4px_0_#111] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Analyzing chaos..." : "Start PMFreak Analysis"}
          </button>
        </form>

        {error ? <p className="mt-4 rounded-xl border-2 border-black bg-[#ffe2e2] px-4 py-3 font-semibold text-red-700">{error}</p> : null}
      </section>

      {finalResponse ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {parsedResponse?.hasStructured ? (
            <>
              {parsedResponse.diagnosis ? (
                <article className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#111]">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Diagnosis</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{parsedResponse.diagnosis}</p>
                </article>
              ) : null}
              <article className="rounded-3xl border-2 border-black bg-[#fff3fb] p-6 shadow-[6px_6px_0_#111]">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Next Move</p>
                <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{parsedResponse.diagnosis || "Use this diagnosis to align ownership and define a recovery decision this week."}</p>
              </article>
              {parsedResponse.communication ? (
                <article className="rounded-3xl border-2 border-black bg-[#fff7ea] p-6 shadow-[6px_6px_0_#111] lg:col-span-2">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Communication / Message</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{parsedResponse.communication}</p>
                </article>
              ) : null}
            </>
          ) : (
            <article className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#111] lg:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">PMFreak analysis</p>
              <p className="mt-3 whitespace-pre-wrap text-sm font-medium text-black/85">{finalResponse}</p>
            </article>
          )}
        </section>
      ) : null}

      {isInitialized ? (
        <section className="rounded-3xl border-2 border-black bg-[#fff3fb] p-6 shadow-[6px_6px_0_#111]">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-pink-700">Initialization</p>
          <p className="mt-2 text-base font-black text-black">PMFreak is initialized.</p>
          <div className="mt-4">
            <Link href="/dashboard" className="inline-flex rounded-full border-2 border-black bg-pink-600 px-5 py-2 text-xs font-black uppercase tracking-[0.08em] text-white shadow-[4px_4px_0_#111] transition hover:-translate-y-0.5">
              Go to Dashboard
            </Link>
          </div>
        </section>
      ) : null}

      {persistenceWarning ? <p className="rounded-xl border-2 border-black bg-[#fff0cd] px-4 py-3 font-semibold text-amber-700">{persistenceWarning}</p> : null}
    </div>
  );
}
