"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/** The LED strip over a shelf: it switches on when the shelf scrolls in. */
export function LedStrip({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="led-strip"
        initial={false}
        animate={
          reduce || inView
            ? { scaleX: 1, opacity: [0.35, 1, 0.45, 1] }
            : { scaleX: 0.04, opacity: 0.35 }
        }
        transition={{ scaleX: { duration: 1.1, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.9, times: [0, 0.6, 0.75, 1], delay: 0.5 } }}
      />
    </div>
  );
}
