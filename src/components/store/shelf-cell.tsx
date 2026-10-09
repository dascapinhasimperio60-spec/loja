"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

/**
 * One cell of a hook shelf. Each cell carries its own LED segment; the
 * segments of a row meet across the gap, so every row reads as one strip
 * that switches on as it scrolls into view.
 */
export function ShelfCell({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const on = reduce || inView;

  return (
    <motion.li ref={ref} layout="position" transition={{ type: "spring", stiffness: 260, damping: 30 }} className="relative pt-5">
      <motion.span
        aria-hidden
        className="led-strip led-seg pointer-events-none absolute -inset-x-2 top-0 sm:-inset-x-3"
        initial={false}
        animate={on ? { scaleX: 1, opacity: [0.3, 1, 0.5, 1] } : { scaleX: 0.02, opacity: 0.3 }}
        transition={{
          scaleX: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.05 },
          opacity: { duration: 0.8, times: [0, 0.55, 0.7, 1], delay: 0.35 },
        }}
        style={{ transformOrigin: "left center", position: "absolute" }}
      />
      {children}
    </motion.li>
  );
}
