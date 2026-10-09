import "server-only";
import { requireAdmin } from "@/lib/admin/auth";
import { brandOf } from "@/lib/models";
import type { Category, Product } from "@/lib/types";
import type { DailyPoint, DashboardData, Metric, Period, ProductRow, Slice, Totals } from "@/lib/analytics-types";

const SOURCE_LABEL: Record<string, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  google: "Google",
  facebook: "Facebook",
  tiktok: "TikTok",
  direto: "Direto / link salvo",
  outros: "Outros sites",
};
const DEVICE_LABEL: Record<string, string> = { mobile: "Celular", desktop: "Computador" };
const PAGE_LABEL: Record<string, string> = { home: "Página inicial", vitrine: "Vitrine", produto: "Páginas de produto", outra: "Outras" };
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const spDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

type RawStats = {
  daily: DailyPoint[];
  products: { product_id: string; views: number; ml: number; whatsapp: number; prev_views: number; prev_ml: number; prev_whatsapp: number }[];
  visits: { page: string; source: string; device: string; sessions: number; pageviews: number; prev_sessions: number; prev_pageviews: number }[];
};

function sumTotals(points: DailyPoint[], intent: number): Totals {
  const t = { sessions: 0, pageviews: 0, views: 0, ml: 0, whatsapp: 0 } as Record<Metric, number>;
  for (const p of points) for (const k of Object.keys(t) as Metric[]) t[k] += Number(p[k]) || 0;
  return { ...t, ctr: t.views ? t.ml / t.views : 0, intent };
}

function slices(map: Map<string, { value: number; prev: number }>, labels: Record<string, string>): Slice[] {
  return Array.from(map, ([key, v]) => ({ key, label: labels[key] ?? key, ...v }))
    .filter((s) => s.value > 0 || s.prev > 0)
    .sort((a, b) => b.value - a.value);
}

/** Pure assembly, shared with the dev preview (synthetic data). */
export function buildDashboard(period: Period, to: string, raw: RawStats, products: Product[], categories: Category[], needsMigration: boolean): DashboardData {
  const split = addDays(to, -(period - 1));
  const from = addDays(split, -period);
  const daily = raw.daily.filter((d) => d.day >= split).map(normalizePoint);
  const prevDaily = raw.daily.filter((d) => d.day < split).map(normalizePoint);

  const stat = new Map(raw.products.map((p) => [p.product_id, p]));
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  const rows: ProductRow[] = products.map((p) => {
    const s = stat.get(p.id);
    const views = s?.views ?? 0;
    const ml = s?.ml ?? 0;
    return {
      id: p.id,
      code: p.code,
      title: p.title,
      slug: p.slug,
      price: p.price,
      category: (p.category_id && catName.get(p.category_id)) || "Sem categoria",
      brands: Array.from(new Set(p.models.map(brandOf))),
      active: p.active,
      sold_out: p.sold_out,
      featured: p.featured,
      thumb: p.images[0]?.thumb_url ?? null,
      views,
      ml,
      whatsapp: s?.whatsapp ?? 0,
      prev_ml: s?.prev_ml ?? 0,
      ctr: views ? ml / views : 0,
      intent: ml * p.price,
    };
  });

  const intent = rows.reduce((acc, r) => acc + r.intent, 0);
  const prevIntent = products.reduce((acc, p) => acc + (stat.get(p.id)?.prev_ml ?? 0) * p.price, 0);

  const bySource = new Map<string, { value: number; prev: number }>();
  const byDevice = new Map<string, { value: number; prev: number }>();
  const byPage = new Map<string, { value: number; prev: number }>();
  for (const v of raw.visits) {
    const add = (m: Map<string, { value: number; prev: number }>, k: string, val: number, prev: number) => {
      const e = m.get(k) ?? { value: 0, prev: 0 };
      e.value += val;
      e.prev += prev;
      m.set(k, e);
    };
    add(bySource, v.source, v.sessions, v.prev_sessions);
    add(byDevice, v.device, v.sessions, v.prev_sessions);
    add(byPage, v.page, v.pageviews, v.prev_pageviews);
  }

  const byCategory = new Map<string, { value: number; prev: number }>();
  const byBrand = new Map<string, { value: number; prev: number }>();
  for (const r of rows) {
    const c = byCategory.get(r.category) ?? { value: 0, prev: 0 };
    c.value += r.ml;
    c.prev += r.prev_ml;
    byCategory.set(r.category, c);
    for (const b of r.brands.length ? r.brands : ["Outros"]) {
      const e = byBrand.get(b) ?? { value: 0, prev: 0 };
      e.value += r.ml;
      e.prev += r.prev_ml;
      byBrand.set(b, e);
    }
  }

  const weekdaySum = WEEKDAYS.map(() => ({ value: 0, prev: 0, n: 0 }));
  for (const d of daily) {
    const w = new Date(`${d.day}T12:00:00Z`).getUTCDay();
    weekdaySum[w].value += d.sessions;
    weekdaySum[w].n += 1;
  }
  const weekdays: Slice[] = WEEKDAYS.map((label, i) => ({
    key: String(i),
    label,
    value: weekdaySum[i].n ? weekdaySum[i].value / weekdaySum[i].n : 0,
    prev: 0,
  }));

  const active = rows.filter((r) => r.active);

  return {
    period,
    from: split,
    to,
    daily,
    prevDaily,
    totals: sumTotals(daily, intent),
    prevTotals: sumTotals(prevDaily, prevIntent),
    sources: slices(bySource, SOURCE_LABEL),
    devices: slices(byDevice, DEVICE_LABEL),
    pages: slices(byPage, PAGE_LABEL),
    categories: slices(byCategory, {}),
    brands: slices(byBrand, {}),
    weekdays,
    products: rows,
    health: {
      published: active.length,
      drafts: rows.length - active.length,
      soldOut: rows.filter((r) => r.sold_out).length,
      featured: rows.filter((r) => r.featured).length,
      noModels: products.filter((p) => p.models.length === 0).length,
      noCategory: products.filter((p) => !p.category_id).length,
      stale: active.filter((r) => r.views === 0 && !r.sold_out).slice(0, 12),
    },
    needsMigration,
    compareFrom: from,
  };
}

function normalizePoint(p: DailyPoint): DailyPoint {
  return {
    day: String(p.day).slice(0, 10),
    sessions: Number(p.sessions) || 0,
    pageviews: Number(p.pageviews) || 0,
    views: Number(p.views) || 0,
    ml: Number(p.ml) || 0,
    whatsapp: Number(p.whatsapp) || 0,
  };
}

export async function getDashboard(period: Period, products: Product[], categories: Category[]): Promise<DashboardData> {
  const { supabase } = await requireAdmin();
  const to = spDay(new Date());
  const split = addDays(to, -(period - 1));
  const from = addDays(split, -period);

  const { data, error } = await supabase.rpc("dashboard_stats", { p_from: from, p_split: split, p_to: to });
  if (error) {
    // Function missing: the 0002 migration has not been applied yet.
    const missing = error.code === "PGRST202" || error.code === "42883" || /dashboard_stats/.test(error.message ?? "");
    if (!missing) console.error("[dashboard]", error);
    const empty: RawStats = { daily: [], products: [], visits: [] };
    for (let d = from; d <= to; d = addDays(d, 1)) empty.daily.push({ day: d, sessions: 0, pageviews: 0, views: 0, ml: 0, whatsapp: 0 });
    return buildDashboard(period, to, empty, products, categories, true);
  }
  return buildDashboard(period, to, data as RawStats, products, categories, false);
}
