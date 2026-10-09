import { ArrowDownRight, ArrowUpRight, Minus } from "@phosphor-icons/react/dist/ssr";
import { fmtPct } from "@/lib/number-format";

/** Signed change vs the previous period: icon + sign + color, never color alone. */
export function Delta({ value, compact = false, upIsGood = true }: { value: number | null; compact?: boolean; upIsGood?: boolean }) {
  if (value === null) return <span className="text-xs font-semibold text-muted">novo</span>;
  const flat = Math.abs(value) < 0.005;
  const good = flat ? null : value > 0 === upIsGood;
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  const tone = good === null ? "text-muted" : good ? "text-ok" : "text-danger";
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold tabular ${tone} ${compact ? "text-xs" : "text-sm"}`}>
      <Icon size={compact ? 12 : 14} weight="bold" aria-hidden />
      {flat ? "0%" : `${value > 0 ? "+" : ""}${fmtPct(value)}`}
      <span className="sr-only">{flat ? "estável" : value > 0 ? "aumento" : "queda"} em relação ao período anterior</span>
    </span>
  );
}
