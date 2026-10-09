"use client";

import { useRef } from "react";

/** A specular highlight that follows the pointer across the acrylic. */
export function SignSheen({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--sx", `${((e.clientX - r.left) / r.width) * 100}%`);
    ref.current.style.setProperty("--sy", `${((e.clientY - r.top) / r.height) * 100}%`);
    ref.current.style.setProperty("--so", "1");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={() => ref.current?.style.setProperty("--so", "0")}
      className="relative [--so:0] [--sx:50%] [--sy:30%]"
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[0.85rem] opacity-[var(--so)] mix-blend-soft-light transition-opacity duration-700 sm:rounded-[1.1rem]"
        style={{ background: "radial-gradient(420px circle at var(--sx) var(--sy), rgba(255,255,255,0.55), transparent 60%)" }}
      />
    </div>
  );
}
