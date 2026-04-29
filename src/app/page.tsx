import Link from "next/link";

const trustMarkers = ["Project rescue", "PMO discipline", "Executive visibility", "AI-ready workflows"];

const painCards = [
  "Nobody knows who owns what",
  "Every meeting creates more meetings",
  "Scope changes arrive disguised as ‘small tweaks’",
  "Status reports say green, reality says fire",
  "Vendors disappear exactly when needed",
  "Go-live is tomorrow and nobody is calm",
];

const outcomes = [
  "Clear owners",
  "Real timelines",
  "Risk visibility",
  "Follow-up discipline",
  "Executive reporting",
  "Delivery momentum",
];

const services = [
  {
    title: "Rescue Sprint",
    description:
      "A focused intervention to diagnose chaos, align owners, rebuild the plan, and create immediate execution momentum.",
    bestFor: "Stuck or escalated projects",
    cta: "Start a Sprint",
  },
  {
    title: "Fractional PM Lead",
    description:
      "Senior PM leadership for teams that need execution discipline without hiring full-time.",
    bestFor: "Growing teams without PM structure",
    cta: "Bring PM Freak In",
  },
  {
    title: "Project Operating System",
    description:
      "Templates, rituals, dashboards, governance, and reporting flows your team can actually use.",
    bestFor: "Companies scaling delivery",
    cta: "Build My PM System",
  },
];

const steps = [
  "Diagnose the chaos",
  "Rebuild the plan",
  "Assign real ownership",
  "Run weekly execution rhythm",
  "Report clearly and stabilize",
];

const moments = [
  "When they say: ‘It’s just a small change.’",
  "When nobody updated the tracker.",
  "When the vendor says: ‘We’re checking internally.’",
  "When go-live is tomorrow.",
  "When the client asks for one more meeting.",
  "When everything is urgent, but nothing is clear.",
];

const noteDoodle = (
  <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
    <rect x="6" y="6" width="28" height="28" rx="4" fill="#fffef9" stroke="#15120f" strokeWidth="2" />
    <path d="M12 14h16M12 20h16M12 26h10" stroke="#15120f" strokeWidth="2" strokeLinecap="round" />
    <circle cx="30" cy="26" r="3" fill="#118383" />
  </svg>
);

function PmFreakFace({ mood = "chaos" }: { mood?: "chaos" | "calm" | "celebration" }) {
  const eyePath = mood === "calm" ? "M150 143q10 8 20 0M210 143q10 8 20 0" : "M150 139q10-8 20 0M210 139q10-8 20 0";
  const mouthPath = mood === "calm" ? "M160 192q28 18 56 0" : mood === "celebration" ? "M158 194q30 24 60 0" : "M162 192q28-18 56 0";
  const teethPath = "M170 202h40M178 196v12M190 196v12M202 196v12";
  const eyeSize = mood === "calm" ? 4 : 7;

  return (
    <>
      <path d="M96 82c38-46 126-52 182-2" fill="none" stroke="#15120f" strokeWidth="7" strokeLinecap="round" />
      <path d="M108 104c34-30 88-42 144-18 22 10 40 24 52 40" fill="none" stroke="#15120f" strokeWidth="7" strokeLinecap="round" />
      <circle cx="186" cy="154" r="84" fill="#fffdf8" stroke="#15120f" strokeWidth="7" />
      <path d="M112 132c20-18 40-32 64-40M128 168c12-22 30-44 54-64M258 92c-22 12-38 28-52 48M276 134c-16-20-40-34-68-42" fill="none" stroke="#15120f" strokeWidth="7" strokeLinecap="round" />
      <rect x="122" y="124" width="68" height="50" rx="22" fill="none" stroke="#15120f" strokeWidth="8" />
      <rect x="186" y="124" width="68" height="50" rx="22" fill="none" stroke="#15120f" strokeWidth="8" />
      <path d="M190 146h2" stroke="#15120f" strokeWidth="8" strokeLinecap="round" />
      <path d={eyePath} fill="none" stroke="#15120f" strokeWidth="6" strokeLinecap="round" />
      <circle cx="160" cy="151" r={eyeSize} fill="#15120f" />
      <circle cx="220" cy="151" r={eyeSize} fill="#15120f" />
      <path d={mouthPath} fill="none" stroke="#15120f" strokeWidth="7" strokeLinecap="round" />
      {mood !== "calm" ? <path d={teethPath} fill="none" stroke="#15120f" strokeWidth="5" strokeLinecap="round" /> : null}
      <circle cx="124" cy="194" r="10" fill="#53d4e0" stroke="#15120f" strokeWidth="5" />
      <circle cx="248" cy="194" r="10" fill="#53d4e0" stroke="#15120f" strokeWidth="5" />
    </>
  );
}

function PmFreakMascot({ mode }: { mode: "chaos" | "calm" | "celebration" }) {
  return (
    <svg viewBox="0 0 380 300" className="w-full" aria-label={`PM Freak mascot ${mode}`}>
      <PmFreakFace mood={mode} />
      {mode === "chaos" ? <path d="M60 60l-16-8M320 64l18-10M92 52l-8-14M280 52l12-14" stroke="#15120f" strokeWidth="5" strokeLinecap="round" /> : null}
      {mode === "calm" ? <rect x="252" y="212" width="34" height="34" rx="8" fill="#118383" stroke="#15120f" strokeWidth="4" /> : null}
      {mode === "calm" ? <path d="M262 230l8 8 12-16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /> : null}
      {mode === "celebration" ? <path d="M186 20v24M144 30l10 18M228 30l-10 18M116 52l18 12M256 52l-18 12" fill="none" stroke="#15120f" strokeWidth="5" strokeLinecap="round" /> : null}
    </svg>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#efe4d3] px-5 py-8 text-[#15120f] md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="grid gap-6 rounded-3xl border-2 border-black bg-[#f8f1e3] p-6 shadow-[10px_10px_0_#15120f] md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#118383]">PM Freak • Chaos to Execution</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">
              Projects don’t fail from complexity. They fail from chaos.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-black/80 md:text-lg">
              PM Freak helps companies regain control of messy projects, unclear ownership, missed deadlines, and
              stakeholder chaos before it becomes cost.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="mailto:hello@pmfreak.com?subject=Rescue%20My%20Project"
                className="rounded-full bg-[#118383] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0d6e6e]"
              >
                Rescue My Project
              </Link>
              <Link
                href="#how-it-works"
                className="rounded-full border-2 border-black bg-white px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              >
                See How It Works
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl border-2 border-black bg-[#fffaf2] p-4">
            <div className="absolute right-4 top-4 h-3 w-3 animate-pulse rounded-full bg-red-500" />
            <div className="absolute -left-2 top-6 h-12 w-10 -rotate-12 rounded-md border-2 border-black bg-white shadow-sm transition group-hover:-translate-y-1" />
            <div className="absolute right-5 top-20 h-10 w-8 rotate-12 rounded-md border-2 border-black bg-[#f6ecda]" />
            <PmFreakMascot mode="chaos" />
          </div>
        </section>

        <section className="grid gap-3 rounded-2xl border-2 border-black bg-[#e2d4bd] p-4 text-center text-sm font-semibold sm:grid-cols-2 lg:grid-cols-4">
          {trustMarkers.map((item) => (
            <p key={item} className="rounded-full border-2 border-black bg-[#f8f2e7] px-3 py-2">
              {item}
            </p>
          ))}
        </section>

        <section id="services" className="rounded-3xl border-2 border-black bg-[#fffaf1] p-6 md:p-8">
          <h2 className="text-3xl font-extrabold">Signs your project needs PM Freak.</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {painCards.map((card) => (
              <article
                key={card}
                className="rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_#15120f] transition hover:-translate-y-1"
              >
                <div className="mb-3">{noteDoodle}</div>
                <p className="text-sm font-semibold leading-relaxed">{card}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 rounded-3xl border-2 border-black bg-[#f5ecdb] p-6 md:grid-cols-[1fr_0.9fr] md:p-8">
          <div>
            <h2 className="text-3xl font-extrabold">Order, without the corporate theater.</h2>
            <p className="mt-3 text-black/80">
              We install the operating rhythm your project was missing: clear owners, real timelines, visible risks,
              disciplined follow-up, and executive-ready reporting.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {outcomes.map((outcome) => (
                <div key={outcome} className="rounded-xl border-2 border-black bg-white px-4 py-3 text-sm font-semibold">
                  {outcome}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-black bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#118383]">After chaos</p>
            <PmFreakMascot mode="calm" />
          </div>
        </section>

        <section className="rounded-3xl border-2 border-black bg-[#fffaf1] p-6 md:p-8">
          <h2 className="text-3xl font-extrabold">Mascot modes</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border-2 border-black bg-white p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#118383]">Chaos mode</p><PmFreakMascot mode="chaos" /></article>
            <article className="rounded-2xl border-2 border-black bg-white p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#118383]">Calm organized mode</p><PmFreakMascot mode="calm" /></article>
            <article className="rounded-2xl border-2 border-black bg-white p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#118383]">Celebration mode</p><PmFreakMascot mode="celebration" /></article>
          </div>
        </section>

        <section className="rounded-3xl border-2 border-black bg-[#fffaf1] p-6 md:p-8">
          <h2 className="text-3xl font-extrabold">Choose your rescue mode.</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="flex rounded-2xl border-2 border-black bg-white p-5 shadow-[6px_6px_0_#15120f] transition hover:-translate-y-1">
                <div className="flex flex-1 flex-col">
                  <h3 className="text-xl font-bold">{service.title}</h3>
                  <p className="mt-3 text-sm text-black/80">{service.description}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#118383]">Best for: {service.bestFor}</p>
                  <Link href="mailto:hello@pmfreak.com" className="mt-5 inline-flex w-fit rounded-full border-2 border-black px-4 py-2 text-sm font-semibold hover:bg-[#f5ecdb]">
                    {service.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="rounded-3xl border-2 border-black bg-[#f5ecdb] p-6 md:p-8">
          <h2 className="text-3xl font-extrabold">From chaos to execution in 5 moves.</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => (
              <li key={step} className="relative rounded-xl border-2 border-black bg-white p-4 text-sm font-semibold shadow-[4px_4px_0_#15120f]">
                <span className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-[#118383] text-xs text-white">
                  {index + 1}
                </span>
                <p>{step}</p>
                {index < steps.length - 1 ? (
                  <span className="absolute -right-3 top-1/2 hidden h-0.5 w-5 bg-black md:block" aria-hidden />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl border-2 border-black bg-[#fffaf1] p-6 md:p-8">
          <h2 className="text-3xl font-extrabold">PM Freak moments</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {moments.map((moment) => (
              <article key={moment} className="rounded-2xl border-2 border-black bg-[#fff2db] p-4 text-sm font-semibold italic transition hover:-translate-y-1 hover:bg-[#ffedd0]">
                “{moment}”
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="rounded-3xl border-2 border-black bg-[#17130f] p-8 text-center text-white">
          <h2 className="text-3xl font-extrabold">Fix the chaos before the next escalation.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/85">
            Bring PM Freak into your project and turn noise into ownership, motion, and delivery.
          </p>
          <Link
            href="mailto:hello@pmfreak.com?subject=Book%20a%20Rescue%20Call"
            className="mt-6 inline-flex rounded-full bg-[#118383] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0f6d6d]"
          >
            Book a Rescue Call
          </Link>
        </section>

        <footer className="pb-3 text-center text-sm font-semibold">
          <p>PM Freak — Chaos to Execution.</p>
          <div className="mt-2 flex items-center justify-center gap-5 text-black/70">
            <Link href="#services" className="hover:text-black">Services</Link>
            <Link href="#how-it-works" className="hover:text-black">How It Works</Link>
            <Link href="#contact" className="hover:text-black">Contact</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
