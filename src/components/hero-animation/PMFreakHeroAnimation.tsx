"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FloatingLabel } from "./FloatingLabel";
import { PMFreakFace } from "./PMFreakFace";
import { SceneText } from "./SceneText";
import { SpiralToTracks } from "./SpiralToTracks";
import { ToyTrain } from "./ToyTrain";

type Phase = 0 | 1 | 2 | 3 | 4 | 5;

const PHASE_MS = 1700;

export function PMFreakHeroAnimation() {
  const [phase, setPhase] = useState<Phase>(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((prev) => (((prev + 1) % 6) as Phase));
    }, PHASE_MS);

    return () => window.clearInterval(id);
  }, []);

  const showChaos = phase === 0 || phase === 1;
  const showFace = phase <= 2;
  const showSpirals = phase === 1 || phase === 2;
  const showFromChaos = phase === 2;
  const showTracks = phase === 3 || phase === 4 || phase === 5;
  const showTrain = phase === 4;
  const showFinal = phase === 5;

  return (
    <div className="relative min-h-[340px] w-full overflow-hidden rounded-3xl border-2 border-black bg-[radial-gradient(circle_at_center,#ffe4ec_0%,#fff8ec_50%,#ffffff_100%)] shadow-[8px_8px_0_#000] md:min-h-[460px]">
      <div className="absolute inset-0">
        {showChaos ? (
          <>
            <FloatingLabel text="Scope Creep" className="left-[4%] top-[16%]" delay={0} />
            <FloatingLabel text="Shipping Delay" className="right-[8%] top-[20%]" delay={0.12} />
            <FloatingLabel text="No Owner" className="left-[10%] top-[65%]" delay={0.24} />
            <FloatingLabel text="Missing Docs" className="right-[7%] top-[62%]" delay={0.36} />
            <FloatingLabel text="Escalation" className="left-[34%] top-[7%]" delay={0.48} />
          </>
        ) : null}

        <motion.div
          className="absolute left-1/2 top-[15%] z-30 h-[175px] w-[175px] -translate-x-1/2 md:h-[225px] md:w-[225px]"
          initial={false}
          animate={{
            opacity: showFace ? 1 : 0,
            scale: showSpirals ? [1, 1.04, 1] : 1,
            rotate: showChaos ? [-1, 1, -1] : 0,
          }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          <PMFreakFace spirals={showSpirals} />
        </motion.div>

        <SpiralToTracks phase={showFromChaos ? "spiral" : showTracks ? "tracks" : "hidden"} />

        <SceneText
          text="From chaos to..."
          active={showFromChaos}
          className="left-1/2 top-[47%] -translate-x-1/2"
        />

        <ToyTrain active={showTrain} />

        <SceneText
          text="Back on Track"
          active={showFinal}
          className="left-1/2 top-[16%] -translate-x-1/2 bg-[#ff1493] text-white"
        />

        <motion.div
          className="absolute left-1/2 top-[31%] z-50 h-[165px] w-[165px] -translate-x-1/2 md:h-[215px] md:w-[215px]"
          initial={false}
          animate={{
            opacity: showFinal ? 1 : 0,
            y: showFinal ? 0 : 10,
            scale: showFinal ? 1 : 0.88,
          }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <PMFreakFace calm />
        </motion.div>
      </div>
    </div>
  );
}
