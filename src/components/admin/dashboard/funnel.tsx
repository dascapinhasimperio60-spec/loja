import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { fmtInt } from "@/lib/number-format";

type Step = { label: string; value: number; hint: string; rate?: string | null };

/**
 * Visitors → product views → "Comprar". A visitor can see several products,
 * so each step carries its own rate sentence instead of a naive % of the
 * previous bar, and bars scale to the largest step.
 */
export function Funnel({ steps }: { steps: Step[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <ol className="space-y-1">
      {steps.map((s, i) => (
        <li key={s.label}>
          {i > 0 && (
            <p className="flex items-center gap-1.5 py-1.5 pl-1 text-xs text-muted">
              <CaretDown size={12} weight="bold" aria-hidden />
              {s.rate ?? "sem dados no período"}
            </p>
          )}
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold text-led">{s.label}</span>
            <strong className="font-black tabular text-led">{fmtInt(s.value)}</strong>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-r-[4px] bg-white/[0.05]">
            <div className="h-full rounded-r-[4px] bg-sign transition-[width] duration-700" style={{ width: `${Math.max(1.5, (s.value / max) * 100)}%` }} />
          </div>
          <p className="mt-1 text-xs text-faint">{s.hint}</p>
        </li>
      ))}
    </ol>
  );
}
