"use client";

import Image from "next/image";
import Link from "next/link";

export function AnimatedHero() {
  return (
    <section id="hero" className="scroll-mt-28 grid gap-8 rounded-3xl border-2 border-black bg-[#fff8ec] p-6 shadow-[10px_10px_0_#161616] md:grid-cols-[1.05fr_0.95fr] md:p-10">
      <div className="flex flex-col justify-center">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-pink-600">AI Project Manager</p>

        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          Your AI Project Manager that keeps execution on track.
        </h1>

        <p className="mt-5 max-w-xl text-base font-medium text-black/80 md:text-lg">
          PMFreak detects project drift, nudges hard when things get risky, and brings execution back on track.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-full border-2 border-black bg-pink-500 px-6 py-3 text-sm font-black text-white shadow-[4px_4px_0_#161616] transition hover:-translate-y-0.5">
            Try PMFreak
          </Link>

          <Link href="/#product" className="rounded-full border-2 border-black bg-white px-6 py-3 text-sm font-black shadow-[4px_4px_0_#161616] transition hover:-translate-y-0.5">
            See the product
          </Link>
        </div>
      </div>

      <div className="relative min-h-[460px] overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[8px_8px_0_#161616]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffe4ec_0%,#fff8ec_45%,#ffffff_100%)]" />

        <div className="freak-face absolute left-1/2 top-10 z-30 w-56 -translate-x-1/2 md:w-64">
          <Image src="/Cara.png" alt="PMFreak freak alert face" width={480} height={480} priority className="h-auto w-full object-contain" />

          <div className="eyebrow absolute left-[44%] top-[39%] h-2 w-12 -rotate-6 rounded-full bg-black" />
          <div className="eye-spiral left-eye" />
          <div className="eye-spiral right-eye" />
        </div>

        <div className="chaos-copy absolute left-8 top-24 z-40 rotate-[-7deg] rounded-2xl border-2 border-black bg-pink-500 px-5 py-2 text-3xl font-black text-white shadow-[4px_4px_0_#161616]">
          From chaos!
        </div>

        <div className="to-copy absolute left-1/2 top-[46%] z-40 -translate-x-1/2 rounded-full border-2 border-black bg-white px-5 py-2 text-2xl font-black shadow-[4px_4px_0_#161616]">
          to
        </div>

        <div className="track-copy absolute right-7 top-24 z-40 rotate-[3deg] rounded-2xl border-2 border-black bg-white px-5 py-2 text-3xl font-black shadow-[4px_4px_0_#161616]">
          Back on Track!
        </div>

        <svg className="chaos-spiral absolute inset-0 z-20 h-full w-full" viewBox="0 0 640 460" fill="none">
          <path d="M320 180 C250 105 145 150 170 250 C202 380 455 350 470 220 C486 90 285 80 245 190 C210 290 365 315 390 210 C408 135 280 135 278 205" stroke="#ec4899" strokeWidth="8" strokeLinecap="round" />
          <path d="M320 180 C215 70 65 150 105 300 C155 455 565 410 570 215 C575 40 260 20 185 200" stroke="#161616" strokeWidth="4" strokeLinecap="round" strokeDasharray="15 13" />
        </svg>

        <svg className="tracks absolute bottom-20 left-1/2 z-30 w-[105%] -translate-x-1/2" viewBox="0 0 640 140" fill="none">
          <path d="M0 58 C120 35 230 35 330 58 C450 84 535 84 640 58" stroke="#161616" strokeWidth="7" strokeLinecap="round" />
          <path d="M0 94 C120 71 230 71 330 94 C450 120 535 120 640 94" stroke="#161616" strokeWidth="7" strokeLinecap="round" />
          {Array.from({ length: 14 }).map((_, i) => (
            <path key={i} d={`M${32 + i * 44} 55 L${48 + i * 44} 101`} stroke="#161616" strokeWidth="4" strokeLinecap="round" />
          ))}
        </svg>

        <div className="train absolute bottom-[92px] left-[-180px] z-40">
          <div className="relative h-16 w-36 rounded-xl border-2 border-black bg-white shadow-[4px_4px_0_#161616]">
            <div className="absolute -top-8 left-5 h-9 w-11 rounded-t-lg border-2 border-black bg-white" />
            <div className="absolute right-3 top-4 h-5 w-5 rounded-full border-2 border-black bg-pink-500" />
            <div className="absolute -bottom-4 left-5 h-8 w-8 rounded-full border-2 border-black bg-white" />
            <div className="absolute -bottom-4 right-6 h-8 w-8 rounded-full border-2 border-black bg-white" />
            <div className="smoke smoke-a" />
            <div className="smoke smoke-b" />
            <div className="smoke smoke-c" />
          </div>
        </div>

        <div className="calm-face absolute left-1/2 top-14 z-50 w-52 -translate-x-1/2 md:w-60">
          <Image src="/Cara.png" alt="PMFreak calm on-track face" width={480} height={480} className="h-auto w-full object-contain" />
          <div className="smile absolute left-[43%] top-[63%] h-8 w-16 rounded-b-full border-b-4 border-black" />
          <div className="wink absolute left-[55%] top-[48%] h-2 w-10 rounded-full bg-black" />
          <div className="ok-badge absolute -right-3 bottom-6 rounded-full border-2 border-black bg-emerald-300 px-3 py-1 text-xs font-black shadow-[3px_3px_0_#161616]">
            GREEN
          </div>
        </div>
      </div>

      <style jsx>{`
        .freak-face {
          animation: freakFace 9s infinite ease-in-out;
        }

        .eyebrow {
          animation: nervousBrow 0.12s infinite alternate;
        }

        .eye-spiral {
          position: absolute;
          top: 51%;
          height: 28px;
          width: 28px;
          border: 4px solid #ec4899;
          border-left-color: transparent;
          border-radius: 9999px;
          animation: eyeSpin 0.45s infinite linear;
        }

        .left-eye {
          left: 37%;
        }

        .right-eye {
          left: 59%;
        }

        .chaos-spiral {
          transform-origin: 52% 42%;
          animation: spiralToTracks 9s infinite ease-in-out;
        }

        .chaos-copy {
          opacity: 0;
          animation: chaosCopy 9s infinite ease-in-out;
        }

        .to-copy {
          opacity: 0;
          animation: toCopy 9s infinite ease-in-out;
        }

        .track-copy {
          opacity: 0;
          animation: trackCopy 9s infinite ease-in-out;
        }

        .tracks {
          opacity: 0;
          animation: tracksReveal 9s infinite ease-in-out;
        }

        .train {
          opacity: 0;
          animation: trainPass 9s infinite ease-in-out;
        }

        .calm-face {
          opacity: 0;
          animation: calmFace 9s infinite ease-in-out;
        }

        .smoke {
          position: absolute;
          top: -48px;
          border: 2px solid #161616;
          background: white;
          border-radius: 9999px;
          opacity: 0;
        }

        .smoke-a {
          left: 4px;
          height: 18px;
          width: 18px;
          animation: smoke 1.1s infinite ease-out;
        }

        .smoke-b {
          left: 28px;
          height: 14px;
          width: 14px;
          animation: smoke 1.3s infinite ease-out;
        }

        .smoke-c {
          left: 50px;
          height: 10px;
          width: 10px;
          animation: smoke 1.5s infinite ease-out;
        }

        @keyframes nervousBrow {
          from {
            transform: translateX(-2px) rotate(-8deg);
          }
          to {
            transform: translateX(3px) rotate(-2deg);
          }
        }

        @keyframes eyeSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes freakFace {
          0%, 18% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
          }
          30%, 100% {
            opacity: 0;
            transform: translateX(-50%) scale(0.86);
          }
        }

        @keyframes spiralToTracks {
          0% {
            opacity: 0;
            transform: scale(0.08) rotate(0deg);
          }
          12% {
            opacity: 1;
            transform: scale(0.35) rotate(160deg);
          }
          28% {
            opacity: 1;
            transform: scale(1.08) rotate(360deg);
          }
          45% {
            opacity: 0.55;
            transform: scaleX(1.55) scaleY(0.22) rotate(360deg);
          }
          55%, 100% {
            opacity: 0;
            transform: scaleX(1.7) scaleY(0.12) rotate(360deg);
          }
        }

        @keyframes chaosCopy {
          0%, 14% {
            opacity: 0;
            transform: translateY(10px) rotate(-7deg) scale(0.85);
          }
          22%, 36% {
            opacity: 1;
            transform: translateY(0) rotate(-7deg) scale(1);
          }
          46%, 100% {
            opacity: 0;
            transform: translateY(-10px) rotate(2deg) scale(0.9);
          }
        }

        @keyframes toCopy {
          0%, 36% {
            opacity: 0;
            transform: translateX(-50%) translateY(12px) scale(0.8);
          }
          44%, 56% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
          65%, 100% {
            opacity: 0;
          }
        }

        @keyframes tracksReveal {
          0%, 42% {
            opacity: 0;
            transform: translateX(-50%) translateY(26px) scaleX(0.65);
          }
          55%, 82% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scaleX(1);
          }
          92%, 100% {
            opacity: 0;
          }
        }

        @keyframes trackCopy {
          0%, 52% {
            opacity: 0;
            transform: translateY(14px) rotate(3deg) scale(0.9);
          }
          62%, 80% {
            opacity: 1;
            transform: translateY(0) rotate(3deg) scale(1);
          }
          92%, 100% {
            opacity: 0;
          }
        }

        @keyframes trainPass {
          0%, 56% {
            opacity: 0;
            transform: translateX(0);
          }
          62% {
            opacity: 1;
          }
          82% {
            opacity: 1;
            transform: translateX(760px);
          }
          92%, 100% {
            opacity: 0;
            transform: translateX(820px);
          }
        }

        @keyframes calmFace {
          0%, 84% {
            opacity: 0;
            transform: translateX(-50%) translateY(12px) scale(0.85);
          }
          92%, 100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }

        @keyframes smoke {
          0% {
            opacity: 0.9;
            transform: translateY(0) scale(0.7);
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(1.5);
          }
        }
      `}</style>
    </section>
  );
}
