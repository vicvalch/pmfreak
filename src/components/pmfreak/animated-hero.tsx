"use client";

import Image from "next/image";
import Link from "next/link";

export function AnimatedHero() {
  return (
    <section id="hero" className="scroll-mt-28 grid gap-8 rounded-3xl border-2 border-black bg-[#fff8ec] p-6 shadow-[10px_10px_0_#161616] md:grid-cols-[1.05fr_0.95fr] md:p-10">
      <div className="flex flex-col justify-center">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-pink-600">
          AI Project Manager
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
          Your AI Project Manager that keeps execution on track.
        </h1>

        <p className="mt-5 max-w-xl text-base font-medium text-black/80 md:text-lg">
          PMFreak turns project chaos into clear execution, ownership, and communication.
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

      <div className="relative min-h-[430px] overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[8px_8px_0_#161616]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffe4ec_0%,#fff8ec_45%,#ffffff_100%)]" />

        <div className="pm-face absolute left-1/2 top-8 z-20 w-44 -translate-x-1/2 md:w-52">
          <Image src="/Cara.png" alt="PMFreak mascot face" width={420} height={420} priority className="h-auto w-full object-contain" />
        </div>

        <div className="pm-chaos-text absolute left-8 top-24 z-30 rotate-[-8deg] rounded-2xl border-2 border-black bg-pink-500 px-5 py-2 text-3xl font-black text-white shadow-[4px_4px_0_#161616]">
          Chaos!
        </div>

        <svg className="pm-spiral absolute inset-0 z-10 h-full w-full" viewBox="0 0 600 430" fill="none">
          <path d="M300 165 C240 110 150 145 170 230 C195 340 390 325 415 215 C440 110 285 80 250 180 C220 265 345 285 365 205 C382 140 280 130 270 190" stroke="#ec4899" strokeWidth="7" strokeLinecap="round" />
          <path d="M300 165 C210 80 75 145 105 270 C145 405 500 380 520 205 C540 60 250 35 190 185" stroke="#161616" strokeWidth="4" strokeLinecap="round" strokeDasharray="14 12" />
        </svg>

        <div className="pm-track-text absolute right-8 top-24 z-30 rounded-2xl border-2 border-black bg-white px-5 py-2 text-2xl font-black shadow-[4px_4px_0_#161616]">
          Back on Track
        </div>

        <svg className="pm-tracks absolute bottom-16 left-1/2 z-20 w-[86%] -translate-x-1/2" viewBox="0 0 520 120" fill="none">
          <path d="M20 62 C120 20 220 20 310 62 C390 100 455 100 500 70" stroke="#161616" strokeWidth="7" strokeLinecap="round" />
          <path d="M20 92 C120 50 220 50 310 92 C390 130 455 130 500 100" stroke="#161616" strokeWidth="7" strokeLinecap="round" />
          {Array.from({ length: 10 }).map((_, i) => (
            <path key={i} d={`M${55 + i * 42} 57 L${70 + i * 42} 103`} stroke="#161616" strokeWidth="4" strokeLinecap="round" />
          ))}
        </svg>

        <div className="pm-train absolute bottom-20 left-[-160px] z-30">
          <div className="relative h-16 w-32 rounded-xl border-2 border-black bg-white shadow-[4px_4px_0_#161616]">
            <div className="absolute -top-7 left-5 h-8 w-10 rounded-t-lg border-2 border-black bg-white" />
            <div className="absolute right-3 top-4 h-5 w-5 rounded-full border-2 border-black bg-pink-500" />
            <div className="absolute -bottom-4 left-4 h-8 w-8 rounded-full border-2 border-black bg-white" />
            <div className="absolute -bottom-4 right-5 h-8 w-8 rounded-full border-2 border-black bg-white" />
            <div className="pm-smoke absolute -top-12 left-0 h-5 w-5 rounded-full border-2 border-black bg-white" />
            <div className="pm-smoke2 absolute -top-16 left-8 h-4 w-4 rounded-full border-2 border-black bg-white" />
          </div>
        </div>

        <div className="pm-calm absolute bottom-6 left-1/2 z-40 w-24 -translate-x-1/2 opacity-0">
          <Image src="/Cara.png" alt="Calm PMFreak face" width={200} height={200} className="h-auto w-full object-contain" />
        </div>
      </div>

      <style jsx>{`
        .pm-face { animation: facePulse 8s infinite ease-in-out; }
        .pm-spiral { animation: spiralMorph 8s infinite ease-in-out; transform-origin: center; }
        .pm-chaos-text { animation: chaosText 8s infinite ease-in-out; }
        .pm-track-text { animation: trackText 8s infinite ease-in-out; opacity: 0; }
        .pm-tracks { animation: tracksIn 8s infinite ease-in-out; opacity: 0; }
        .pm-train { animation: trainMove 8s infinite ease-in-out; }
        .pm-calm { animation: calmIn 8s infinite ease-in-out; }
        .pm-smoke { animation: smoke 1.2s infinite ease-out; }
        .pm-smoke2 { animation: smoke 1.5s infinite ease-out; }

        @keyframes facePulse {
          0%, 18% { opacity: 1; transform: translateX(-50%) scale(1) rotate(0deg); }
          28%, 70% { opacity: 0.25; transform: translateX(-50%) scale(0.92) rotate(-2deg); }
          82%, 100% { opacity: 1; transform: translateX(-50%) scale(0.9) rotate(0deg); }
        }

        @keyframes spiralMorph {
          0% { opacity: 0; transform: scale(0.2) rotate(0deg); }
          18% { opacity: 1; transform: scale(0.8) rotate(130deg); }
          38% { opacity: 1; transform: scale(1.15) rotate(260deg); }
          58% { opacity: 0.25; transform: scale(1.05) rotate(360deg); }
          70%, 100% { opacity: 0; transform: scale(0.7) rotate(420deg); }
        }

        @keyframes chaosText {
          0%, 12% { opacity: 0; transform: translateY(10px) rotate(-8deg) scale(0.8); }
          22%, 42% { opacity: 1; transform: translateY(0) rotate(-8deg) scale(1); }
          55%, 100% { opacity: 0; transform: translateY(-10px) rotate(4deg) scale(0.9); }
        }

        @keyframes trackText {
          0%, 50% { opacity: 0; transform: translateY(12px) scale(0.9); }
          62%, 88% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; }
        }

        @keyframes tracksIn {
          0%, 45% { opacity: 0; transform: translateX(-50%) translateY(30px) scale(0.85); }
          58%, 100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }

        @keyframes trainMove {
          0%, 58% { transform: translateX(0); opacity: 0; }
          62% { opacity: 1; }
          86% { transform: translateX(700px); opacity: 1; }
          100% { transform: translateX(760px); opacity: 0; }
        }

        @keyframes calmIn {
          0%, 78% { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.8); }
          88%, 100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }

        @keyframes smoke {
          from { opacity: 0.9; transform: translateY(0) scale(0.8); }
          to { opacity: 0; transform: translateY(-28px) scale(1.4); }
        }
      `}</style>
    </section>
  );
}
