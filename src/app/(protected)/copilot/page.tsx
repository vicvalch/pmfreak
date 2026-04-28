"use client";

import { useEffect, useMemo, useState } from "react";

type ProjectOption = { id: string; projectName: string; uploadDate: string };
type CopilotCard = { type: "Risks" | "Next Actions" | "Draft Email" | "RACI" | "Checklist"; title: string; items: string[] };
type CopilotResponse = { answer: string; cards: CopilotCard[]; plan: "free" | "pro" | "enterprise"; aiPowered: boolean };
type ChatMessage = { role: "user" | "assistant"; text: string; response?: CopilotResponse };
const PROMPTS = ["What should I do next?", "Draft a client follow-up email", "Identify project risks", "Prepare meeting minutes", "Build a RACI matrix", "Create a recovery plan", "Generate kickoff checklist", "Generate closure checklist", "Detect out-of-scope requests"];

export default function CopilotPage() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [methodology, setMethodology] = useState<"PMI" | "Agile" | "Hybrid" | "General PMO">("Hybrid");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/copilot/context").then((r) => r.json()).then((d: { projects?: ProjectOption[] }) => setProjects(d.projects ?? [])).catch(() => setProjects([]));
  }, []);

  const selectedProject = useMemo(() => projects.find((p) => p.id === selectedProjectId), [projects, selectedProjectId]);

  const send = async (preset?: string) => {
    const message = (preset ?? input).trim(); if (!message || loading) return;
    setError(null); setMessages((p) => [...p, { role: "user", text: message }]); setInput(""); setLoading(true);
    try {
      const response = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, projectId: selectedProject?.id, projectName: selectedProject?.projectName, methodology }) });
      const payload = (await response.json()) as CopilotResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to get PMO Copilot response.");
      setMessages((p) => [...p, { role: "assistant", text: payload.answer, response: payload }]);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to get PMO Copilot response."); }
    finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 text-white"><main className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[300px_1fr]"><aside className="rounded-3xl border border-white/10 bg-white/5 p-5"><h1 className="text-2xl font-semibold">PMO Copilot</h1><p className="mt-2 text-sm text-slate-300">Senior PMO advisor for next steps, risks, controls, and executive-ready drafts.</p><div className="mt-5 space-y-3"><label className="text-xs uppercase text-cyan-300">Project context</label><select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"><option value="">No project selected</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.projectName}</option>)}</select><label className="text-xs uppercase text-cyan-300">Methodology</label><select value={methodology} onChange={(e) => setMethodology(e.target.value as never)} className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm"><option>Hybrid</option><option>PMI</option><option>Agile</option><option>General PMO</option></select></div></aside><section className="rounded-3xl border border-white/10 bg-white/5 p-5"><div className="mb-4 flex flex-wrap gap-2">{PROMPTS.map((prompt) => <button key={prompt} onClick={() => void send(prompt)} className="rounded-full border border-cyan-300/40 px-3 py-1 text-xs hover:bg-cyan-300/15">{prompt}</button>)}</div><div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 min-h-[420px]">{messages.length === 0 ? <p className="text-sm text-slate-300">Start a conversation with PMO Copilot to get structured delivery guidance.</p> : null}{messages.map((msg, i) => <div key={i} className={`max-w-3xl rounded-2xl p-3 text-sm ${msg.role === "user" ? "ml-auto bg-cyan-500/20" : "bg-slate-800/70"}`}><p>{msg.text}</p>{msg.response?.cards?.length ? <div className="mt-3 grid gap-2 md:grid-cols-2">{msg.response.cards.map((card, idx) => <article key={idx} className="rounded-xl border border-white/10 bg-black/20 p-3"><h3 className="text-xs font-semibold uppercase text-cyan-300">{card.type}</h3><p className="mt-1 text-sm font-medium">{card.title}</p></article>)}</div> : null}</div>)}{loading ? <p className="text-sm text-slate-300">Thinking...</p> : null}{error ? <p className="text-sm text-rose-200">{error}</p> : null}</div><div className="mt-4 flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask PMO Copilot..." className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm" /><button onClick={() => void send()} disabled={loading} className="rounded-xl border border-cyan-300/50 px-4 py-2 text-sm font-semibold">Send</button></div></section></main></div>;
}
