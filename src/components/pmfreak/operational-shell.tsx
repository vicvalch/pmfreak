"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { OPERATIONAL_FLOW, PM_MODULES } from "@/features/navigation/module-registry";

type UserProject = { id: string; name: string };

export function OperationalShell({ children, user }: { children: React.ReactNode; user: { fullName: string; role: string; companyName: string } }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [projectId, setProjectId] = useState<string>(() => search.get("projectId") ?? globalThis.localStorage?.getItem("pmfreak.currentProjectId") ?? "");

  useEffect(() => {
    void fetch("/api/projects").then((r) => r.json()).then((d) => setProjects(d.projects ?? []));
  }, []);

  useEffect(() => {
    if (!projectId) return;
    globalThis.localStorage?.setItem("pmfreak.currentProjectId", projectId);
  }, [projectId]);

  const scopeLabel = useMemo(() => projects.find((p) => p.id === projectId)?.name ?? "Portfolio scope", [projectId, projects]);
  const navHref = (href: string) => (projectId ? `${href}?projectId=${projectId}` : href);

  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#070c17] to-slate-950 text-white"><div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5 md:px-8 md:py-8"><aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:flex"><div className="flex items-center gap-3"><LogoMark size="small" /><div><p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300">PMFreak</p><h2 className="text-sm font-semibold text-slate-100">Command Grid</h2></div></div><p className="mt-3 text-xs text-slate-400">{user.companyName}</p><nav className="mt-6 space-y-2">{PM_MODULES.map((item) => <Link key={item.href} href={navHref(item.href)} className={`block rounded-xl border px-4 py-3 transition ${pathname.startsWith(item.href) ? "border-fuchsia-300/70 bg-gradient-to-r from-fuchsia-500/20 to-cyan-400/15 shadow-[0_0_20px_rgba(232,121,249,0.2)]" : "border-transparent hover:border-cyan-300/40 hover:bg-cyan-300/10"}`}><div className="flex items-center justify-between"><p className="text-sm font-medium text-slate-100">{item.label}</p><span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-slate-300">{item.status}</span></div><p className="mt-1 text-xs text-slate-400">{item.description}</p></Link>)}</nav><div className="mt-auto rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-slate-300"><div className="mb-3 inline-flex rounded-full border border-fuchsia-300/40 bg-fuchsia-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-fuchsia-100">Plan • PMO</div><p className="font-semibold text-white">{user.fullName}</p><p>{user.role}</p><Link href="/team" className="mt-3 inline-block text-cyan-200">Workspace settings</Link><br /><Link href="/logout" className="mt-2 inline-block text-slate-300">Logout</Link></div></aside><div className="flex-1 space-y-4"><header className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><LogoMark size="small" /><div><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Operational Scope</p><p className="text-sm text-slate-200">{scopeLabel}</p></div></div><div className="flex items-center gap-2"><span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-100">{user.companyName}</span><span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-fuchsia-100">Plan PMO</span></div></div><div className="mt-3 flex flex-wrap items-center gap-3"><select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="rounded-lg border border-white/10 bg-black/30 px-3 py-1 text-sm"><option value="">Portfolio scope</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><div className="hidden flex-wrap gap-2 text-xs text-slate-300 md:flex">{OPERATIONAL_FLOW.map((step, idx) => <span key={step}>{step}{idx < OPERATIONAL_FLOW.length - 1 ? " →" : ""}</span>)}</div></div></header><main>{children}</main></div></div></div>;
}
