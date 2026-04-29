import Link from "next/link";

const trustBadges = ["Tenant Isolated", "Enterprise Ready", "Powered by AOC"];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6 py-14 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl md:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
            PMFreak by AOC
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            PMO Copilot Built by Freaks for Delivery Excellence.
          </h1>

          <p className="mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            Turn project chaos into executive-ready decisions with secure tenant-isolated AI workflows,
            delivery risk signals, and guided PMO action plans.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/copilot"
              className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
            >
              Start Secure Demo
            </Link>

            <Link
              href="mailto:sales@pmfreak.ai?subject=Book%20Enterprise%20Pilot"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:border-cyan-300/70 hover:bg-cyan-300/10"
            >
              Book Enterprise Pilot
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100"
              >
                {badge}
              </span>
            ))}
          </div>
        </header>
      </div>
    </main>
  );
}
