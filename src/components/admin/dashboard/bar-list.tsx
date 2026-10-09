"use client";

import { useState } from "react";
import type { Slice } from "@/lib/analytics-types";
import { delta, fmtInt, fmtPct } from "@/lib/number-format";
import { Delta } from "./delta";

type Props = {
  items: Slice[];
  unit: string;
  empty: string;
  /** show share of total next to each value */
  share?: boolean;
  limit?: number;
  format?: (n: number) => string;
};

/** Horizontal magnitude bars: single hue, value at the tip, hover detail. */
export function BarList({ items, unit, empty, share = true, limit = 8, format = fmtInt }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const shown = items.slice(0, limit);
  const total = items.reduce((a, s) => a + s.value, 0);
  const max = Math.max(1, ...shown.map((s) => s.value));

  if (!shown.length || total === 0) return <p className="py-8 text-center text-sm text-muted">{empty}</p>;

  return (
    <ul className="space-y-3.5">
      {shown.map((s) => {
        const active = hover === s.key;
        return (
          <li
            key={s.key}
            className="group"
            onPointerEnter={() => setHover(s.key)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(s.key)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            aria-label={`${s.label}: ${format(s.value)} ${unit}${share ? `, ${fmtPct(s.value / total)} do total` : ""}`}
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-semibold text-led">{s.label}</span>
              <span className="flex shrink-0 items-baseline gap-2 tabular">
                <strong className="font-black text-led">{format(s.value)}</strong>
                {share && <span className="w-12 text-right text-xs text-muted">{fmtPct(s.value / total)}</span>}
              </span>
            </div>
            <div className="relative h-2.5 rounded-r-[4px] bg-white/[0.05]">
              <div
                className={`h-full rounded-r-[4px] transition-[width,filter] duration-700 ease-[var(--ease-out-expo)] ${active ? "brightness-110" : ""}`}
                style={{ width: `${Math.max(1.5, (s.value / max) * 100)}%`, background: "var(--color-sign)" }}
              />
            </div>
            <div className={`mt-1 h-4 text-xs text-muted transition-opacity ${active ? "opacity-100" : "opacity-0"}`} aria-hidden>
              Período anterior: <span className="tabular text-led/80">{format(s.prev)}</span> <Delta value={delta(s.value, s.prev)} compact />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
