"use client";

import { motion } from "framer-motion";

export function PMFreakFace({ calm = false, spirals = false }: { calm?: boolean; spirals?: boolean }) {
  return (
    <svg viewBox="0 0 260 260">
      <circle cx="130" cy="130" r="110" fill="#fff" stroke="#000" strokeWidth="6"/>

      {calm ? (
        <>
          <circle cx="86" cy="112" r="10" fill="#000"/>
          <motion.path
            d="M156 112 Q174 98 192 112"
            stroke="#000"
            strokeWidth="6"
            animate={{ scaleX: [1, 0.6, 1] }} // 👀 wink
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </>
      ) : (
        <>
          <motion.path
            d="M58 78 Q86 58 114 78"
            stroke="#000"
            strokeWidth="6"
            fill="none"
            animate={{ x: [0,-2,2,-1,0] }}
            transition={{ duration: 0.2, repeat: Infinity }}
          />

          {spirals ? (
            <>
              <motion.circle
                cx="86"
                cy="112"
                r="12"
                fill="none"
                stroke="#ff1493"
                strokeWidth="5"
                strokeDasharray="18 8"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "86px 112px" }}
              />
              <motion.circle
                cx="174"
                cy="112"
                r="12"
                fill="none"
                stroke="#ff1493"
                strokeWidth="5"
                strokeDasharray="18 8"
                animate={{ rotate: -360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "174px 112px" }}
              />
            </>
          ) : (
            <>
              <circle cx="86" cy="112" r="10" fill="#000"/>
              <circle cx="174" cy="112" r="10" fill="#000"/>
            </>
          )}
        </>
      )}
    </svg>
  );
}
