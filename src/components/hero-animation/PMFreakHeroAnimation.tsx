"use client";

import { motion } from "framer-motion";

export function PMFreakHeroAnimation() {
  return (
    <div className="relative min-h-[320px] w-full overflow-hidden rounded-3xl border-2 border-black bg-[radial-gradient(circle_at_center,#ffe4ec_0%,#fff8ec_50%,#ffffff_100%)] shadow-[8px_8px_0_#000] md:min-h-[460px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, rotate: -2 }}
          animate={{ scale: [0.9, 1, 0.96, 1], rotate: [-2, 2, -1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-3xl border-2 border-black bg-white px-8 py-6 text-center shadow-[6px_6px_0_#000]"
        >
          <p className="text-2xl font-black text-black md:text-4xl">
            From chaos to...
          </p>
          <p className="mt-3 text-4xl font-black text-pink-500 md:text-6xl">
            Back on Track
          </p>
        </motion.div>
      </div>
    </div>
  );
}
