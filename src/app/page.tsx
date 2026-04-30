import { MarketingNavbar } from "@/components/marketing-navbar";
import Link from "next/link";
import { AnimatedHero } from "@/components/pmfreak/animated-hero";

const productFlow = [
  "Describe the situation",
  "Detect the real execution risk",
  "Route to the right intelligence layer",
  "Get one clear next move",
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

const steps = [
  "Describe what is happening.",
  "PMFreak detects the execution risk.",
  "It tells you what to do and how to communicate it.",
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
              PMFreak is not another project dashboard. It’s an execution brain.
            </h2>

            <p className="mt-4 max-w-3xl text-base font-medium text-black/75 md:text-lg">
              PMFreak detects what’s actually broken in execution, decides what needs to happen next, and helps you communicate it under pressure.
            </p>

            <div className="mt-8 rounded-3xl border-2 border-black bg-white p-5 shadow-[6px_6px_0_#161616]">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
                {productFlow.map((step, index) => (
                  <div key={step} className="contents">
                    <div className="rounded-2xl border-2 border-black bg-[#fff8ec] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-pink-500 text-sm font-black text-white">
                          {index + 1}
                        </div>
                        <p className="text-sm font-black">{step}</p>
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
                Here’s a deeper look at the reasoning layers that make PMFreak keep everything on track.
              </h3>

              <p className="mt-3 max-w-2xl text-sm font-medium text-black/70">
                Each layer is designed to remove ambiguity, force clarity, and push execution forward.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {modules.map((module) => (
                  <article key={module.title} className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-pink-600">
                      {module.subtitle}
                    </p>
                    <h4 className="mt-2 text-lg font-black">{module.title}</h4>
                    <p className="mt-2 text-sm font-medium text-black/70">{module.text}</p>
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
    One input. One diagnosis. One next move.
  </h2>

  <p className="mt-4 max-w-2xl text-sm font-medium text-black/70">
    PMFreak doesn’t give you options. It gives you clarity.
  </p>

  <div className="mt-8 rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#161616]">
    <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">

      <div className="rounded-2xl border-2 border-black bg-[#fff8ec] p-5">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-pink-600">
          Input
        </p>
        <p className="mt-2 text-sm font-bold">
          You describe what’s happening in your project.
        </p>
      </div>

      <div className="hidden h-1 w-10 rounded-full bg-black md:block" />

      <div className="rounded-2xl border-2 border-black bg-[#fff8ec] p-5">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-pink-600">
          Diagnosis
        </p>
        <p className="mt-2 text-sm font-bold">
          PMFreak detects the real execution risk behind the situation.
        </p>
      </div>

      <div className="hidden h-1 w-10 rounded-full bg-black md:block" />

      <div className="rounded-2xl border-2 border-black bg-[#fff8ec] p-5">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-pink-600">
          Action
        </p>
        <p className="mt-2 text-sm font-bold">
          You get one clear next move — including how to communicate it.
        </p>
      </div>

    </div>
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
              <Link href="/signup" className="rounded-full border-2 border-black bg-pink-500 px-7 py-3 text-sm font-black text-white shadow-[4px_4px_0_#161616] transition hover:-translate-y-0.5">
                Try PMFreak
              </Link>

              <Link href="/pricing" className="rounded-full border-2 border-black bg-white px-7 py-3 text-sm font-black shadow-[4px_4px_0_#161616] transition hover:-translate-y-0.5">
                See pricing
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
