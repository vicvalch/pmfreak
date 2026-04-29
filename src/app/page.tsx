import Image from "next/image";
import Link from "next/link";
import { PmFreakMascot } from "@/components/brand/pm-freak-mascot";

const trustBadges = ["Loved by chaotic teams", "AI-assisted PM rhythm", "Board-ready updates"];
const painPoints = [
  "‘Quick update?’ became a 2-hour meeting.",
  "Status is green. Reality is screaming.",
  "Owners vanished the second launch got real.",
  "Timeline moved. Nobody told finance.",
  "One tiny scope change caused seven fires.",
  "Your PM tool is full, but clarity is empty.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5ead9] px-5 py-6 text-[#161616] md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <nav className="flex items-center justify-between rounded-2xl border-2 border-black bg-[#fffaf2] px-4 py-3 shadow-[6px_6px_0_#161616] md:px-6">
          <div className="flex items-center gap-3">
            <Image src="/brand/pmfreak-logo.png" alt="PM Freak" width={44} height={44} className="h-11 w-11 rounded-lg object-cover" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#118383]">PM Freak</p>
              <p className="text-sm font-semibold">Chaos to shipping velocity</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/pricing" className="rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-semibold hover:bg-[#efe4d3]">Pricing</Link>
            <Link href="/login" className="rounded-full bg-[#161616] px-4 py-2 text-sm font-semibold text-white hover:bg-black">Log in</Link>
          </div>
        </nav>

        <section className="grid gap-6 rounded-3xl border-2 border-black bg-[#fff8ec] p-6 shadow-[10px_10px_0_#161616] md:grid-cols-[1.05fr_0.95fr] md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#118383]">Duolingo energy. Linear discipline.</p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Your favorite project goblin, now running your PM stack.</h1>
            <p className="mt-4 max-w-xl text-base text-black/80 md:text-lg">PM Freak turns panic threads into crisp priorities, real ownership, and updates your execs actually trust.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/copilot" className="rounded-full bg-[#118383] px-6 py-3 text-sm font-bold text-white hover:-translate-y-0.5 hover:bg-[#0d6f6f]">Start Freak Mode</Link>
              <Link href="/pricing" className="rounded-full border-2 border-black bg-white px-6 py-3 text-sm font-bold hover:-translate-y-0.5">See Plans</Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {trustBadges.map((badge) => (
                <span key={badge} className="rounded-full border-2 border-black bg-[#efe4d3] px-3 py-1 text-xs font-semibold">{badge}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <article className="rounded-2xl border-2 border-black bg-white p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#118383]">Current mood: chaotic</p>
              <PmFreakMascot mood="chaos" />
            </article>
            <article className="rounded-2xl border-2 border-black bg-[#e8f7f8] p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#118383]">After PM Freak: calm + shipping</p>
              <PmFreakMascot mood="calm" />
            </article>
          </div>
        </section>

        <section className="rounded-3xl border-2 border-black bg-[#fffaf2] p-6 md:p-8">
          <h2 className="text-3xl font-extrabold">If these sound familiar, you’re our people.</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {painPoints.map((point) => (
              <article key={point} className="rounded-2xl border-2 border-black bg-white p-4 shadow-[4px_4px_0_#161616]">
                <p className="text-sm font-semibold">{point}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 rounded-3xl border-2 border-black bg-[#f0e1c7] p-6 md:grid-cols-3">
          <article className="rounded-2xl border-2 border-black bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#118383]">Chaos mode</p><p className="mt-1 text-sm">Everything is urgent. Nobody agrees what “done” means.</p></article>
          <article className="rounded-2xl border-2 border-black bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#118383]">Command mode</p><p className="mt-1 text-sm">PM Freak builds one source of truth, owners, and weekly momentum.</p></article>
          <article className="rounded-2xl border-2 border-black bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#118383]">Victory mode</p><p className="mt-1 text-sm">You ship, execs smile, and meetings stop multiplying.</p><PmFreakMascot mood="celebration" className="mt-2 w-40" /></article>
        </section>
      </div>
      </main>
  );
}
