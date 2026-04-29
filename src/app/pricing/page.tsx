import Link from "next/link";

const pilots = [
  {
    name: "Pilot Starter",
    price: "$7,500 / 30 days",
    description: "Single PMO squad proving AI governance workflows on live delivery work.",
    features: ["1 business unit", "Seeded PMO Copilot prompts", "Weekly executive readout"],
  },
  {
    name: "Pilot Scale",
    price: "$18,000 / 60 days",
    description: "Cross-functional deployment with portfolio memory and operating cadence.",
    features: ["Up to 5 delivery teams", "Portfolio-level risk rollups", "Dedicated solution architect"],
  },
  {
    name: "Enterprise Rollout",
    price: "Custom annual",
    description: "Full enterprise operating model, controls, and managed expansion plan.",
    features: ["Tenant isolation controls", "Security + procurement support", "SLA + roadmap governance"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
            ScopeGuard AI • Enterprise Pilots
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Pilot packages built for PMO transformation
          </h1>
          <p className="mt-2 text-slate-300">
            Start with a guided pilot, prove measurable value, then scale with governance confidence.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {pilots.map((plan) => (
            <article
              key={plan.name}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
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
            href="mailto:sales@scopeguard.ai?subject=Enterprise%20Pilot%20Package"
            className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
          >
            Book Enterprise Pilot
          </Link>
        </div>
      </div>
    </main>
  );
}
