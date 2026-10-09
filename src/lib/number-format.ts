const int = new Intl.NumberFormat("pt-BR");
const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const pct = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlCompact = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });

export const fmtInt = (n: number) => int.format(Math.round(n));
export const fmtCompact = (n: number) => (Math.abs(n) < 10000 ? int.format(Math.round(n)) : compact.format(n));
export const fmtPct = (n: number) => pct.format(n);
export const fmtBrl = (n: number) => (Math.abs(n) < 100000 ? brl.format(n) : brlCompact.format(n));

/** Change vs previous period; null when there is no base to compare with. */
export function delta(current: number, previous: number) {
  if (!previous) return current ? null : 0;
  return (current - previous) / previous;
}

const dayMonth = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
const dayMonthLong = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: "UTC" });
const monthShort = new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" });
const weekdayLong = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

const d = (iso: string) => new Date(`${iso}T12:00:00Z`);
export const fmtDay = (iso: string) => dayMonth.format(d(iso));
export const fmtDayLong = (iso: string) => dayMonthLong.format(d(iso)).replace(".", "");
export const fmtMonth = (iso: string) => monthShort.format(d(iso)).replace(".", "");
export const fmtWeekday = (iso: string) => weekdayLong.format(d(iso)).replace(/\./g, "");
