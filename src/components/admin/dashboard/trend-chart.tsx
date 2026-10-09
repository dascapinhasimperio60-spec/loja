"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { DailyPoint, Metric } from "@/lib/analytics-types";
import { fmtCompact, fmtDay, fmtInt, fmtMonth, fmtWeekday } from "@/lib/number-format";

const H = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };
const ACCENT = "var(--color-sign)";
const PREV = "#8a8984";

function niceMax(v: number) {
  if (v <= 4) return 4;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / exp;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * exp;
}

type Props = {
  current: DailyPoint[];
  previous: DailyPoint[];
  metric: Metric;
  label: string;
  showPrevious: boolean;
};

/** Single-series area/line with a dashed previous-period line, crosshair and tooltip. */
export function TrendChart({ current, previous, metric, label, showPrevious }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = current.length;
  const values = current.map((p) => p[metric]);
  const prevValues = current.map((_, i) => previous[i]?.[metric] ?? 0);
  const max = niceMax(Math.max(1, ...values, ...(showPrevious ? prevValues : [])));
  const innerW = width - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const line = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line(values)}L${x(n - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  const xLabels = useMemo(() => {
    if (n === 0) return [];
    const count = Math.min(n, width < 520 ? 4 : 7);
    const idx = Array.from({ length: count }, (_, k) => Math.round((k / Math.max(1, count - 1)) * (n - 1)));
    return Array.from(new Set(idx)).map((i) => ({ i, text: n > 120 ? fmtMonth(current[i].day) : fmtDay(current[i].day) }));
  }, [n, width, current]);

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const i = Math.round(((px - PAD.left) / innerW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
    else if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? n) - 1));
    else if (e.key === "Escape") setHover(null);
    else return;
    e.preventDefault();
  }

  const h = hover;
  const tipLeft = h !== null ? Math.min(Math.max(x(h) - 90, 0), width - 180) : 0;

  return (
    <div ref={wrap} className="relative w-full min-w-0 overflow-hidden">
      <svg
        width="100%"
        height={H}
        viewBox={`0 0 ${width} ${H}`}
        preserveAspectRatio="none"
        className="block w-full touch-pan-y outline-none"
        role="img"
        aria-label={`${label} por dia. Use as setas para percorrer os dias.`}
        tabIndex={0}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffcc29" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ffcc29" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
            <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-[var(--color-faint)] text-[11px] tabular">
              {fmtCompact(t)}
            </text>
          </g>
        ))}
        {xLabels.map(({ i, text }) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-[var(--color-faint)] text-[11px]">
            {text}
          </text>
        ))}

        {showPrevious && <path d={line(prevValues)} fill="none" stroke={PREV} strokeWidth={1.5} strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />}
        <path d={area} fill={`url(#${gradId})`} />
        <path d={line(values)} fill="none" stroke={ACCENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {n > 0 && h === null && (
          <circle cx={x(n - 1)} cy={y(values[n - 1])} r={4} fill={ACCENT} stroke="var(--color-panel)" strokeWidth={2} />
        )}

        {h !== null && (
          <g pointerEvents="none">
            <line x1={x(h)} x2={x(h)} y1={PAD.top} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
            {showPrevious && <circle cx={x(h)} cy={y(prevValues[h])} r={4} fill={PREV} stroke="var(--color-panel)" strokeWidth={2} />}
            <circle cx={x(h)} cy={y(values[h])} r={5} fill={ACCENT} stroke="var(--color-panel)" strokeWidth={2} />
          </g>
        )}
      </svg>

      {h !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 w-[180px] rounded-xl bg-panel-3/95 px-3 py-2.5 text-sm shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur"
          style={{ left: tipLeft }}
          role="status"
        >
          <p className="text-xs capitalize text-muted">{fmtWeekday(current[h].day)}</p>
          <p className="mt-1 flex items-center gap-2">
            <span className="h-0.5 w-3 rounded-full bg-sign" aria-hidden />
            <strong className="text-base font-black tabular text-led">{fmtInt(values[h])}</strong>
            <span className="text-xs text-muted">{label.toLowerCase()}</span>
          </p>
          {showPrevious && previous[h] && (
            <p className="mt-0.5 flex items-center gap-2 text-muted">
              <span className="h-0 w-3 border-t border-dashed border-[#8a8984]" aria-hidden />
              <span className="tabular text-led/80">{fmtInt(prevValues[h])}</span>
              <span className="text-xs">em {fmtDay(previous[h].day)}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
