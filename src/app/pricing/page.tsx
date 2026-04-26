import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For solo teams evaluating ScopeGuard.",
    features: ["Limited monthly uploads", "Rule-based analysis", "Basic dashboard"],
  },
  {
    name: "Pro",
    price: "$79/mo",
    description: "For delivery teams that need AI acceleration.",
    features: ["Unlimited uploads", "AI analysis", "Executive + matrix exports"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For multi-team organizations and governance controls.",
    features: ["Team roles", "Portfolio memory", "Priority support + invoicing"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">ScopeGuard AI • Sprint 8</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Simple, transparent pricing</h1>
          <p className="mt-2 text-slate-300">Start free and upgrade when your team needs AI automation and scale.</p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-3xl font-bold text-cyan-200">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-300">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <div className="text-center">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
