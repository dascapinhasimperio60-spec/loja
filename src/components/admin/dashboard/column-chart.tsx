"use client";

import { useState } from "react";
import type { Slice } from "@/lib/analytics-types";
import { fmtInt } from "@/lib/number-format";

/** Seven columns (<= 24px), value on the hovered cap, peak labelled. */
export function ColumnChart({ items, unit }: { items: Slice[]; unit: string }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...items.map((s) => s.value));
  const peak = items.reduce((a, b) => (b.value > a.value ? b : a), items[0]);

  return (
    <div className="flex h-44 items-end justify-between gap-2 border-b border-white/[0.07] px-1">
      {items.map((s) => {
        const show = hover === s.key || (hover === null && s.key === peak?.key && s.value > 0);
        return (
          <div
            key={s.key}
            className="flex h-full flex-1 flex-col items-center justify-end"
            onPointerEnter={() => setHover(s.key)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(s.key)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            aria-label={`${s.label}: média de ${fmtInt(s.value)} ${unit} por dia`}
          >
            <span className={`mb-1.5 text-xs font-black tabular text-led transition-opacity ${show ? "opacity-100" : "opacity-0"}`}>{fmtInt(s.value)}</span>
            <div
              className={`w-full max-w-6 rounded-t-[4px] transition-[height,filter] duration-700 ease-[var(--ease-out-expo)] ${hover === s.key ? "brightness-110" : ""}`}
              style={{ height: `${Math.max(2, (s.value / max) * 100)}%`, background: s.value ? "var(--color-sign)" : "rgba(255,255,255,0.08)" }}
            />
            <span className="mt-2 text-xs font-semibold text-muted">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}
