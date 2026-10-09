import { notFound } from "next/navigation";
import { buildDashboard } from "@/lib/admin/analytics";
import { demoCatalog } from "@/lib/demo-data";
import { PERIODS, type Period } from "@/lib/analytics-types";
import { AdminShell } from "@/components/admin/admin-shell";
import { Dashboard } from "@/components/admin/dashboard/dashboard";

/**
 * Development-only preview of the admin dashboard with synthetic numbers,
 * used to review the layout without logging in. Returns 404 in production.
 */
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export default async function DevDashboardPreview({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { periodo } = await searchParams;
  const period = (PERIODS as readonly number[]).includes(Number(periodo)) ? (Number(periodo) as Period) : 30;

  const rand = rng(42);
  const to = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const days = period * 2;
  const daily = Array.from({ length: days }, (_, i) => {
    const d = new Date(`${to}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    const dow = d.getUTCDay();
    const growth = 0.7 + (i / days) * 0.6;
    const weekly = dow === 6 ? 1.45 : dow === 5 ? 1.25 : dow === 0 ? 0.8 : 1;
    const sessions = Math.round((40 + rand() * 25) * growth * weekly);
    const views = Math.round(sessions * (1.6 + rand() * 0.5));
    return {
      day: d.toISOString().slice(0, 10),
      sessions,
      pageviews: Math.round(sessions * (2.6 + rand())),
      views,
      ml: Math.round(views * (0.07 + rand() * 0.04)),
      whatsapp: Math.round(views * (0.02 + rand() * 0.015)),
    };
  });

  const products = demoCatalog.products.map((p, i) => {
    const w = Math.max(0.05, 1 - i * 0.075) * (0.6 + rand() * 0.8);
    const views = i === 11 ? 0 : Math.round(900 * w);
    return {
      product_id: p.id,
      views,
      ml: Math.round(views * (0.06 + rand() * 0.06)),
      whatsapp: Math.round(views * 0.025),
      prev_views: Math.round(views * (0.7 + rand() * 0.5)),
      prev_ml: Math.round(views * 0.07 * (0.6 + rand() * 0.6)),
      prev_whatsapp: Math.round(views * 0.02),
    };
  });

  const sources = [
    ["instagram", 0.52],
    ["direto", 0.18],
    ["whatsapp", 0.14],
    ["google", 0.11],
    ["facebook", 0.03],
    ["outros", 0.02],
  ] as const;
  const totalSessions = daily.slice(period).reduce((a, d) => a + d.sessions, 0);
  const visits = sources.flatMap(([source, share]) =>
    (["mobile", "desktop"] as const).flatMap((device) =>
      (["home", "vitrine", "produto"] as const).map((page) => {
        const deviceShare = device === "mobile" ? 0.82 : 0.18;
        const pageShare = page === "home" ? 0.55 : page === "vitrine" ? 0.25 : 0.2;
        const s = Math.round(totalSessions * share * deviceShare * pageShare);
        return { page, source, device, sessions: s, pageviews: Math.round(s * 2.8), prev_sessions: Math.round(s * 0.82), prev_pageviews: Math.round(s * 2.3) };
      }),
    ),
  );

  const data = buildDashboard(period, to, { daily, products, visits }, demoCatalog.products, demoCatalog.categories, false);

  return (
    <AdminShell email="lojista@imperiodascapinhas.com.br" storeUrl="http://localhost:3000" publishedCount={demoCatalog.products.length}>
      <div className="mx-auto max-w-[1280px]">
        <Dashboard data={data} />
      </div>
    </AdminShell>
  );
}
