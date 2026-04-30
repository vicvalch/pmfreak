import { MarketingNavbar } from "@/components/marketing-navbar";
import Link from "next/link";
import { AnimatedHero } from "@/components/pmfreak/animated-hero";

const modules = [
  {
    title: "Execution Diagnosis",
    text: "Detects the real execution failure behind delays, unclear ownership, and project drift.",
  },
  {
    title: "Smart Message Nudges",
    text: "Rewrites risky updates for clients, executives, and internal teams before they create damage.",
  },
  {
    title: "Meta Intelligence Routing",
    text: "Understands whether the problem is execution, communication, strategy, or all three.",
  },
  {
    title: "PMFreak Brain",
    text: "Orchestrates the right intelligence layer and returns one clear next move.",
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

  <div className="mt-8 grid gap-4 md:grid-cols-4">
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
      <p className="font-black">1</p>
      <p className="mt-2 font-bold">Describe the situation</p>
    </div>

    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
      <p className="font-black">2</p>
      <p className="mt-2 font-bold">PMFreak detects the real execution risk</p>
    </div>

    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
      <p className="font-black">3</p>
      <p className="mt-2 font-bold">Routes it to the right intelligence layer</p>
    </div>

    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
      <p className="font-black">4</p>
      <p className="mt-2 font-bold">Gives one clear next move</p>
    </div>
  </div>

  <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
      <h3 className="font-black">Execution Diagnosis</h3>
      <p className="mt-2 text-sm text-black/70">
        Detects what’s actually broken behind delays and unclear ownership.
      </p>
    </div>

    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
      <h3 className="font-black">Smart Message Nudges</h3>
      <p className="mt-2 text-sm text-black/70">
        Fixes how you communicate under pressure.
      </p>
    </div>

    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
      <h3 className="font-black">Meta Intelligence</h3>
      <p className="mt-2 text-sm text-black/70">
        Understands whether the problem is execution, communication, or strategy.
      </p>
    </div>

    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
      <h3 className="font-black">PMFreak Brain</h3>
      <p className="mt-2 text-sm text-black/70">
        Orchestrates everything into one clear decision.
      </p>
    </div>
  </div>
</section>


          <section id="how" className="scroll-mt-28 rounded-3xl border-2 border-black bg-[#f0e1c7] p-6 md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              One input. One diagnosis. One next move.
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <article key={step} className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
                  <p className="text-sm font-black text-pink-600">0{index + 1}</p>
                  <p className="mt-3 text-lg font-black">{step}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="intelligence" className="scroll-mt-28 rounded-3xl border-2 border-black bg-[#fffaf2] p-6 md:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600">
              Intelligence
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Built as a layered AI PM brain.
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {modules.map((module) => (
                <article key={module.title} className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0_#161616]">
                  <h3 className="text-xl font-black">{module.title}</h3>
                  <p className="mt-2 text-sm font-medium text-black/75">{module.text}</p>
                </article>
              ))}
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
