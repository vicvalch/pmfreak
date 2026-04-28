import Link from "next/link";
import { requireAuthUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/upload", label: "Upload" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/copilot", label: "PMO Copilot" },
  { href: "/billing", label: "Billing" },
];

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuthUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-5 py-6 md:px-8 md:py-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl md:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">ScopeGuard AI</p>
            <h2 className="mt-3 text-xl font-semibold">Sprint 8</h2>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-transparent px-4 py-2.5 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
            <p className="font-semibold text-white">{user.fullName}</p>
            <p className="mt-1 text-slate-300">{user.companyName}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cyan-300">{user.role}</p>
            <a
              href="/logout"
              className="mt-4 inline-flex rounded-lg border border-rose-300/50 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-300/10"
            >
              Logout
            </a>
          </div>
        </aside>

        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
