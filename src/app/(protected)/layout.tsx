import Link from "next/link";
import { requireAuthUser } from "@/lib/auth";

const navItems = [
  { href: "/copilot", label: "PMO Copilot" },
  { href: "/billing", label: "Billing" },
  { href: "/pricing", label: "Pricing" },
];

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-5 py-6 md:px-8 md:py-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl md:flex">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
              PMFreak by AOC
            </p>
            <h2 className="mt-3 text-xl font-semibold">PMO Workspace</h2>
            <p className="mt-2 text-xs text-slate-400">{user.companyName}</p>
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

          <div className="mt-auto rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-slate-300">
            <p className="font-semibold text-white">{user.fullName}</p>
            <p>{user.role}</p>
            <Link href="/logout" className="mt-3 inline-block text-cyan-200">
              Logout
            </Link>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
