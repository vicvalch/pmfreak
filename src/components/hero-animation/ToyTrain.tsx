"use client";

import { motion } from "framer-motion";

type ToyTrainProps = {
  active: boolean;
};

export function ToyTrain({ active }: ToyTrainProps) {
  return (
    <motion.div
      className="absolute bottom-[88px] left-[-170px] z-40"
      initial={false}
      animate={{
        x: active ? ["0vw", "120vw"] : "0vw",
        opacity: active ? [0, 1, 1, 0] : 0,
      }}
      transition={{
        duration: 3.1,
        ease: "linear",
      }}
    >
      <svg viewBox="0 0 190 110" className="h-[78px] w-[135px] md:h-[96px] md:w-[168px]" aria-label="Toy train">
        <rect x="16" y="38" width="108" height="40" rx="9" fill="#fff" stroke="#000" strokeWidth="4" />
        <rect x="38" y="18" width="36" height="28" rx="6" fill="#fff" stroke="#000" strokeWidth="4" />
        <rect x="84" y="22" width="20" height="18" rx="4" fill="#000" />
        <path d="M124 48 L152 60 L124 72Z" fill="#fff" stroke="#000" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="46" cy="86" r="13" fill="#fff" stroke="#000" strokeWidth="4" />
        <circle cx="102" cy="86" r="13" fill="#fff" stroke="#000" strokeWidth="4" />
        <circle cx="128" cy="56" r="10" fill="#ff1493" stroke="#000" strokeWidth="4" />

        <motion.circle cx="30" cy="14" r="8" fill="#ff9ad6" animate={{ cy: active ? [-4, -18, -30] : 14, opacity: active ? [0.7, 0.4, 0] : 0 }} transition={{ duration: 1.3, repeat: Infinity, ease: "easeOut" }} />
        <motion.circle cx="48" cy="10" r="6" fill="#ffc4e7" animate={{ cy: active ? [0, -15, -28] : 10, opacity: active ? [0.6, 0.35, 0] : 0 }} transition={{ duration: 1.25, repeat: Infinity, ease: "easeOut", delay: 0.18 }} />
        <motion.circle cx="18" cy="18" r="5" fill="#ff1493" animate={{ cy: active ? [6, -10, -24] : 18, opacity: active ? [0.45, 0.25, 0] : 0 }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.35 }} />
      </svg>
    </motion.div>
  );
}
