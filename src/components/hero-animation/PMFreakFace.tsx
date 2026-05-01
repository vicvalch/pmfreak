"use client";

import { motion } from "framer-motion";

type PMFreakFaceProps = {
  calm?: boolean;
  spirals?: boolean;
};

export function PMFreakFace({ calm = false, spirals = false }: PMFreakFaceProps) {
  return (
    <svg
      viewBox="0 0 260 260"
      className="h-full w-full"
      aria-label={calm ? "Calm PMFreak face" : "Freaked-out PMFreak face"}
    >
      <path d="M65 55 C35 62 20 95 28 130 C12 150 20 190 52 202 C70 238 120 248 157 232 C205 239 238 199 230 153 C250 120 235 78 199 63 C164 22 100 18 65 55Z" fill="#fff" stroke="#000" strokeWidth="6" strokeLinejoin="round" />

      <path d="M54 52 L41 21 M76 43 L73 11 M101 36 L111 8 M132 38 L151 13 M161 45 L191 24 M190 62 L226 50" stroke="#000" strokeWidth="6" strokeLinecap="round" />

      <circle cx="86" cy="112" r="31" fill="#fff" stroke="#000" strokeWidth="6" />
      <circle cx="174" cy="112" r="31" fill="#fff" stroke="#000" strokeWidth="6" />

      <path d="M54 108 C68 98 100 98 117 110" stroke="#000" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M143 110 C160 98 193 98 207 109" stroke="#000" strokeWidth="5" strokeLinecap="round" fill="none" />

      {calm ? (
        <>
          <circle cx="86" cy="112" r="10" fill="#000" />
          <path d="M156 112 Q174 98 192 112" stroke="#000" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M88 176 Q130 210 172 176" stroke="#000" strokeWidth="8" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <motion.path
            d="M58 78 Q86 58 114 78"
            stroke="#000"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            animate={{ x: [0, -3, 3, -1, 0], y: [0, -2, 1, 0, 0] }}
            transition={{ duration: 0.28, repeat: Infinity, repeatType: "loop", ease: "linear", repeatDelay: 0.9 }}
          />
          <path d="M146 78 Q174 58 202 78" stroke="#000" strokeWidth="7" strokeLinecap="round" fill="none" />

          {spirals ? (
            <>
              <motion.path d="M78 112 C76 101 95 101 94 114 C93 128 72 126 72 111" stroke="#ff1493" strokeWidth="5" strokeLinecap="round" fill="none" animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} style={{ originX: "86px", originY: "112px" }} />
              <motion.path d="M166 112 C164 101 183 101 182 114 C181 128 160 126 160 111" stroke="#ff1493" strokeWidth="5" strokeLinecap="round" fill="none" animate={{ rotate: -360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} style={{ originX: "174px", originY: "112px" }} />
            </>
          ) : (
            <>
              <circle cx="86" cy="112" r="10" fill="#000" />
              <circle cx="174" cy="112" r="10" fill="#000" />
            </>
          )}

          <path d="M91 184 Q130 164 169 184" stroke="#000" strokeWidth="8" strokeLinecap="round" fill="none" />
        </>
      )}

      <circle cx="42" cy="143" r="7" fill="#14b8a6" stroke="#000" strokeWidth="4" />
      <circle cx="218" cy="143" r="7" fill="#14b8a6" stroke="#000" strokeWidth="4" />
    </svg>
  );
}
