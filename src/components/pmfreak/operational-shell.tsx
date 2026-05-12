"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OPERATIONAL_FLOW, PM_MODULES } from "@/features/navigation/module-registry";

type UserProject = { id: string; name: string };

type OperationalShellProps = {
  children: React.ReactNode;
  user: { fullName: string; role: string; companyName: string };
};

export function OperationalShell({ children, user }: OperationalShellProps) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const fromQuery = new URLSearchParams(window.location.search).get("projectId") ?? "";
    const fromStorage = window.localStorage.getItem("pmfreak.currentProjectId") ?? "";
    return fromQuery || fromStorage;
  });

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setProjectsLoading(true);
      setProjectsError(null);
      try {
        const response = await fetch("/api/projects", { cache: "no-store" });
        if (!response.ok) throw new Error(`Unable to load projects (${response.status})`);
        const data = (await response.json()) as { projects?: UserProject[] };
        if (!active) return;
        setProjects(data.projects ?? []);
      } catch {
        if (!active) return;
        setProjects([]);
        setProjectsError("Project list unavailable. Continue in portfolio scope or retry.");
      } finally {
        if (active) setProjectsLoading(false);
      }
    }

    void loadProjects();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!projectId) return;
    globalThis.localStorage?.setItem("pmfreak.currentProjectId", projectId);
  }, [projectId]);

  const scopeLabel = useMemo(() => projects.find((p) => p.id === projectId)?.name ?? "Portfolio scope", [projectId, projects]);
  const navHref = (href: string) => (projectId ? `${href}?projectId=${projectId}` : href);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      <div className="mx-auto flex w-full max-w-[1400px] gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
        <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[19rem] flex-col rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_70px_-50px_rgba(15,23,42,0.9)] backdrop-blur-xl lg:flex">
          <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-200/80">PMFreak</p>
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">Operational Command System</h2>
          <p className="mt-2 text-xs text-slate-400">{user.companyName}</p>

          <nav className="mt-6 space-y-1.5" aria-label="Primary">
            {PM_MODULES.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={navHref(item.href)}
                  className={`group block rounded-2xl border px-4 py-3 transition-all duration-200 ${
                    active ? "border-cyan-200/35 bg-cyan-300/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" : "border-transparent hover:border-white/15 hover:bg-white/[0.03]"
                  }`}
                >
                  <p className={`text-sm font-medium ${active ? "text-cyan-100" : "text-slate-100 group-hover:text-white"}`}>{item.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.description}</p>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">{user.fullName}</p>
            <p className="mt-0.5">{user.role}</p>
            <Link href="/logout" className="mt-3 inline-flex rounded-md text-cyan-200 transition hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300/70">Logout</Link>
          </div>
        </aside>

        <div className="flex-1 space-y-4 md:space-y-5">
          <div className="rounded-3xl border border-white/10 bg-slate-900/55 p-4 shadow-[0_20px_50px_-35px_rgba(8,47,73,0.8)] backdrop-blur-xl md:p-5">
            <div className="mb-4 grid gap-2.5 lg:hidden">
              <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-200/90">Navigate</p>
              <div className="flex snap-x gap-2 overflow-x-auto pb-1">
                {PM_MODULES.map((item) => (
                  <Link key={item.href} href={navHref(item.href)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs transition ${pathname.startsWith(item.href) ? "border-cyan-200/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/[0.02] text-slate-300"}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/90">Project Scope</span>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="rounded-lg border border-white/15 bg-slate-900 px-3 py-1.5 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300/70" disabled={projectsLoading} aria-label="Select project scope">
                <option value="">Portfolio scope</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span className="text-xs text-slate-400">Current: {scopeLabel}</span>
            </div>

            {projectsLoading ? <p className="mt-2 text-xs text-slate-500">Loading projects…</p> : null}
            {projectsError ? <p className="mt-2 text-xs text-amber-200">{projectsError}</p> : null}
            {!projectsLoading && !projectsError && projects.length === 0 ? <p className="mt-2 text-xs text-cyan-200">No projects yet. Create your first project in the Projects module.</p> : null}

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              {OPERATIONAL_FLOW.map((step, idx) => <span key={step}>{step}{idx < OPERATIONAL_FLOW.length - 1 ? " →" : ""}</span>)}
            </div>
          </div>
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
