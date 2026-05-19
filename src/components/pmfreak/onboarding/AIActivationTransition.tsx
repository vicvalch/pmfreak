"use client";

import { useEffect, useState } from "react";

const SEQUENCE = [
  { label: "Mapping operational context", detail: "Calibrating project intelligence baseline" },
  { label: "Analyzing stakeholder structure", detail: "Identifying influence patterns and pressure vectors" },
  { label: "Establishing execution baseline", detail: "Anchoring delivery confidence and risk telemetry" },
  { label: "Preparing risk telemetry", detail: "Initializing signal monitoring across delivery domains" },
  { label: "Activating PMFreak agents", detail: "Operational intelligence layer is coming online" },
];

const STEP_DURATION = 900;

export function AIActivationTransition({ onComplete }: { onComplete: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    SEQUENCE.forEach((_, i) => {
      timers.push(
        setTimeout(
          () => {
            setActiveIndex(i);
            if (i === SEQUENCE.length - 1) {
              timers.push(
                setTimeout(() => {
                  setDone(true);
                  setTimeout(onComplete, 600);
                }, STEP_DURATION),
              );
            }
          },
          i * STEP_DURATION,
        ),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const progress = done ? 100 : Math.round(((activeIndex + 1) / SEQUENCE.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
      <div className="relative w-full max-w-lg px-6">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -inset-32 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12),transparent_65%)]" />

        <div className="relative space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-400">
              PMFreak Activation
            </p>
            <h2 className="text-2xl font-semibold text-slate-100">
              {done ? "Operational intelligence active" : "Bringing systems online"}
            </h2>
          </div>

          {/* Progress bar */}
          <div className="h-px overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-400 to-cyan-400 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Sequence items */}
          <div className="space-y-2">
            {SEQUENCE.map((item, i) => {
              const isActive = i === activeIndex && !done;
              const isComplete = i < activeIndex || done;
              return (
                <div
                  key={item.label}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 transition-all duration-500 ${
                    isActive
                      ? "border border-indigo-400/30 bg-indigo-400/10"
                      : isComplete
                        ? "opacity-50"
                        : "opacity-20"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] transition-colors duration-500 ${
                      isComplete || done
                        ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-300"
                        : isActive
                          ? "border-indigo-400/60 bg-indigo-400/20 text-indigo-300"
                          : "border-white/20 text-slate-600"
                    }`}
                  >
                    {isComplete || done ? "✓" : isActive ? "●" : "○"}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isActive ? "text-slate-100" : isComplete ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {item.label}
                      {isActive && <span className="ml-1 animate-pulse">...</span>}
                    </p>
                    {isActive && (
                      <p className="mt-0.5 text-xs text-indigo-300/70">{item.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <p className="text-center text-[11px] text-slate-600">
            {done ? "Redirecting to Command Center" : "Establishing operational context"}
          </p>
        </div>
      </div>
    </div>
  );
}
