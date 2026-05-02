import { MarketingNavbar } from "@/components/marketing-navbar";
import Link from "next/link";
import { AnimatedHero } from "@/components/pmfreak/animated-hero";

const productFlow = [
  { title: "Describe", text: "Tell PMFreak what’s happening." },
  { title: "Detect", text: "Find the real execution risk." },
  { title: "Route", text: "Send the issue to the right intelligence layer." },
  { title: "Act", text: "Get one clear next move." },
];

const modules = [
  {
    title: "Execution Diagnosis",
    subtitle: "Find the real failure point",
    text: "Detects what’s actually broken behind delays, unclear ownership, and project drift.",
  },
  {
    title: "Smart Message Nudges",
    subtitle: "Communicate under pressure",
    text: "Rewrites risky updates for clients, executives, and internal teams before they create damage.",
  },
  {
    title: "Meta Intelligence",
    subtitle: "Route the problem correctly",
    text: "Understands whether the issue is execution, communication, strategy, or a mixed-risk situation.",
  },
  {
    title: "PMFreak Brain",
    subtitle: "One unified next move",
    text: "Orchestrates the right reasoning layer and turns chaos into one clear execution decision.",
  },
];

export default function Home() {
  return (
    <>
      <MarketingNavbar />

      <main className="min-h-screen bg-[#f5ead9] px-5 py-6 text-[#161616] md:px-8 md:py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <AnimatedHero />

          <section id="product" className="scroll-mt-28 rounded-3xl border-2 border-black bg-[#fffaf2] p-6 md:p-10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">
              Product
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              PMFreak is an execution brain.
            </h2>

            <p className="mt-4 max-w-3xl text-base font-medium text-black/75 md:text-lg">
              Find what’s broken. Fix what matters. Stay on track.
            </p>

            <div className="mt-8 rounded-3xl border-2 border-black bg-white p-5 shadow-[6px_6px_0_#161616]">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
                {productFlow.map((step, index) => (
                  <div key={step.title} className="contents">
                    <div className="rounded-2xl border-2 border-black bg-[#fff8ec] p-4 transition hover:-translate-y-0.5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-pink-500 text-sm font-black text-white">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-base font-black">{step.title}</p>
                          <p className="mt-1 text-xs font-medium text-black/65">{step.text}</p>
                        </div>
                      </div>
                    </div>

                    {index < productFlow.length - 1 ? (
                      <div className="hidden h-1 w-10 rounded-full bg-black md:block" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">
                Intelligence
              </p>

              <h3 className="mt-2 text-2xl font-black md:text-3xl">
                The intelligence layers behind every next move.
              </h3>

              <p className="mt-3 max-w-2xl text-sm font-medium text-black/70">
                Less guessing. More execution.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {modules.map((module) => (
                  <article key={module.title} className="group rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616] transition hover:-translate-y-1 hover:shadow-[7px_7px_0_#161616]">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-pink-600">
                      {module.subtitle}
                    </p>
                    <h4 className="mt-3 text-lg font-black">{module.title}</h4>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-black/65">{module.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="how" className="scroll-mt-28 rounded-3xl border-2 border-black bg-[#f0e1c7] p-6 md:p-10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              From messy situation to confident action.
            </h2>

            <p className="mt-4 max-w-2xl text-sm font-medium text-black/70">
              The workflow is simple: describe the mess, get the diagnosis, move with confidence.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <article className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#161616]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">
                  01 / Dump the mess
                </p>
                <h3 className="mt-3 text-2xl font-black">No perfect brief required.</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-black/70">
                  Paste the ugly project situation exactly as it is: blockers, pressure, missing owners, client noise.
                </p>
              </article>

              <article className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#161616]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">
                  02 / Get the read
                </p>
                <h3 className="mt-3 text-2xl font-black">PMFreak calls the real risk.</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-black/70">
                  It separates noise from execution failure and tells you what actually needs attention.
                </p>
              </article>

              <article className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#161616]">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-600">
                  03 / Move now
                </p>
                <h3 className="mt-3 text-2xl font-black">One next move. No fog.</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-black/70">
                  You get the action, the message, and the direction needed to bring the project back on track.
                </p>
              </article>
            </div>
          </section>

          <section id="who" className="scroll-mt-28 rounded-3xl border-2 border-black bg-white p-6 md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">
              Who it’s for
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              For PMs, founders, and operators tired of pretending everything is fine.
            </h2>

            <p className="mt-4 max-w-3xl text-base font-medium text-black/75 md:text-lg">
              PMFreak is for people managing messy execution: client pressure, internal ambiguity, weak follow-up, unclear ownership, and projects that keep slipping quietly.
            </p>
          </section>

          <section id="pricing-preview" className="scroll-mt-28 rounded-3xl border-2 border-black bg-[#ffe4ec] p-6 text-center shadow-[10px_10px_0_#161616] md:p-10">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-700">
              Launch access
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              Stop drifting. Get back on track.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base font-medium text-black/75 md:text-lg">
              Start with PMFreak now and turn project chaos into clear execution.
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-full border-2 border-black bg-pink-500 px-7 py-3 text-sm font-black text-white shadow-[4px_4px_0_#161616] transition hover:-translate-y-0.5"
              >
                Try PMFreak
              </Link>

              <Link
                href="/pricing"
                className="rounded-full border-2 border-black bg-white px-7 py-3 text-sm font-black shadow-[4px_4px_0_#161616] transition hover:-translate-y-0.5"
              >
                See pricing
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
