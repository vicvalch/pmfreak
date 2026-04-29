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
            <svg viewBox="0 0 380 300" className="w-full" aria-label="PM Freak mascot illustration">
              <path d="M88 74c12-26 34-37 58-42 13 17 24 19 40 4 27 8 48 22 58 54" fill="none" stroke="#15120f" strokeWidth="4" strokeLinecap="round" className="origin-center animate-[wiggle_2.8s_ease-in-out_infinite]" />
              <circle cx="185" cy="128" r="72" fill="#fffdf8" stroke="#15120f" strokeWidth="4" />
              <rect x="126" y="112" width="44" height="32" rx="10" fill="none" stroke="#15120f" strokeWidth="4" />
              <rect x="198" y="112" width="44" height="32" rx="10" fill="none" stroke="#15120f" strokeWidth="4" />
              <path d="M170 126h28" stroke="#15120f" strokeWidth="4" strokeLinecap="round" />
              <circle cx="147" cy="127" r="4" fill="#15120f" />
              <circle cx="219" cy="127" r="4" fill="#15120f" />
              <path d="M162 164q20-14 40 0" fill="none" stroke="#15120f" strokeWidth="4" strokeLinecap="round" />
              <path d="M134 175h101" stroke="#15120f" strokeWidth="3" strokeDasharray="5 6" />
              <rect x="40" y="202" width="118" height="70" rx="8" fill="#fff" stroke="#15120f" strokeWidth="4" />
              <path d="M52 220h52M52 236h36M52 252h62" stroke="#15120f" strokeWidth="3" strokeLinecap="round" />
              <circle cx="144" cy="218" r="6" fill="#118383" />
              <rect x="186" y="206" width="154" height="76" rx="10" fill="#f3ebdc" stroke="#15120f" strokeWidth="4" />
              <path d="M206 226h114M206 244h80M206 262h66" stroke="#15120f" strokeWidth="3" strokeLinecap="round" />
              <rect x="298" y="234" width="26" height="26" rx="6" fill="#118383" stroke="#15120f" strokeWidth="3" />
            </svg>
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
            <svg viewBox="0 0 250 180" className="mt-3 w-full" aria-hidden>
              <circle cx="84" cy="74" r="42" fill="#fffef8" stroke="#15120f" strokeWidth="3" />
              <path d="M50 56c12-14 21-17 34-16 10 6 18 7 24 1 14 6 20 13 26 26" fill="none" stroke="#15120f" strokeWidth="3" />
              <circle cx="68" cy="74" r="3" fill="#15120f" />
              <circle cx="98" cy="74" r="3" fill="#15120f" />
              <path d="M70 92q15 10 30 0" fill="none" stroke="#15120f" strokeWidth="3" strokeLinecap="round" />
              <rect x="140" y="40" width="86" height="95" rx="8" fill="#f4ecdd" stroke="#15120f" strokeWidth="3" />
              <path d="M154 58h58M154 74h46M154 90h52" stroke="#15120f" strokeWidth="3" strokeLinecap="round" />
              <rect x="154" y="102" width="57" height="21" rx="5" fill="#118383" stroke="#15120f" strokeWidth="3" />
            </svg>
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
