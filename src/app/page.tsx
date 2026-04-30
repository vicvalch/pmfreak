import { MarketingNavbar } from "@/components/marketing-navbar";
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
  <>
    <MarketingNavbar />
    <main className="min-h-screen bg-[#f5ead9] px-5 py-6 text-[#161616] md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">

        <section className="grid gap-6 rounded-3xl border-2 border-black bg-[#fff8ec] p-6 shadow-[10px_10px_0_#161616] md:grid-cols-[1.05fr_0.95fr] md:p-10">
          <div>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">Your favorite project goblin, now running your PM stack.</h1>
            <p className="mt-4 max-w-xl text-base text-black/80 md:text-lg">PM Freak turns panic threads into crisp priorities, real ownership, and updates your execs actually trust.</p>
            <div className="mt-7 flex flex-wrap gap-3">
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
              <PmFreakMascot mood="chaos" />
            </article>
            <article className="rounded-2xl border-2 border-black bg-[#e8f7f8] p-3">
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
        </section>
      </div>
      </main>
    </>
  );
}
