"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  DownloadSimple,
  Printer,
  CaretDown,
  Table,
  ChartLine,
  WarningCircle,
  ArrowRight,
  Plus,
  Lightning,
} from "@phosphor-icons/react";
import { METRIC_LABEL, PERIODS, type DashboardData, type Metric, type Period } from "@/lib/analytics-types";
import { delta, fmtBrl, fmtDay, fmtDayLong, fmtInt, fmtPct } from "@/lib/number-format";
import { download, toCsv } from "@/lib/export-csv";
import { TrendChart } from "./trend-chart";
import { BarList } from "./bar-list";
import { ColumnChart } from "./column-chart";
import { Funnel } from "./funnel";
import { ProductsTable } from "./products-table";
import { Delta } from "./delta";

const PERIOD_LABEL: Record<Period, string> = { 7: "7 dias", 30: "30 dias", 90: "90 dias", 365: "12 meses" };
const CHART_METRICS: Metric[] = ["sessions", "pageviews", "views", "ml", "whatsapp"];

function Card({ title, subtitle, actions, children, className = "" }: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl bg-panel p-5 ring-1 ring-white/[0.06] break-inside-avoid sm:p-6 ${className}`}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[0.95rem] font-black uppercase tracking-[0.01em] text-led wdth-semi">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Kpi({ label, value, change, hint, upIsGood = true }: { label: string; value: string; change: number | null; hint?: string; upIsGood?: boolean }) {
  return (
    <div className="rounded-2xl bg-panel p-4 ring-1 ring-white/[0.06] sm:p-5" title={hint}>
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-1.5 text-[1.7rem] font-black leading-none tracking-[-0.02em] text-led wdth-semi">{value}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-faint">
        <Delta value={change} compact upIsGood={upIsGood} /> vs anterior
      </p>
    </div>
  );
}

export function Dashboard({ data }: { data: DashboardData }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [metric, setMetric] = useState<Metric>("ml");
  const [compare, setCompare] = useState(true);
  const [asTable, setAsTable] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const { totals: t, prevTotals: p } = data;

  useEffect(() => {
    if (!exportOpen) return;
    const close = (e: MouseEvent) => !exportRef.current?.contains(e.target as Node) && setExportOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setExportOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [exportOpen]);

  function setPeriod(period: Period) {
    startTransition(() => router.push(`${pathname}?periodo=${period}`, { scroll: false }));
  }

  const stamp = `${data.from}_${data.to}`;
  const exports = [
    {
      label: "Resumo diário",
      detail: "Visitantes, páginas, produtos vistos e cliques por dia",
      run: () =>
        download(
          `resumo-diario-${stamp}.csv`,
          toCsv(
            ["Data", "Visitantes", "Páginas vistas", "Produtos vistos", "Cliques Comprar", "Cliques WhatsApp", "Data (período anterior)", "Visitantes (anterior)", "Cliques Comprar (anterior)"],
            data.daily.map((d, i) => [d.day, d.sessions, d.pageviews, d.views, d.ml, d.whatsapp, data.prevDaily[i]?.day ?? "", data.prevDaily[i]?.sessions ?? "", data.prevDaily[i]?.ml ?? ""]),
          ),
        ),
    },
    {
      label: "Produtos",
      detail: "Desempenho de cada produto no período",
      run: () =>
        download(
          `produtos-${stamp}.csv`,
          toCsv(
            ["Código", "Produto", "Categoria", "Preço", "Visualizações", "Cliques Comprar", "Cliques WhatsApp", "Taxa de clique", "Intenção (R$)"],
            data.products.map((r) => [r.code, r.title, r.category, r.price, r.views, r.ml, r.whatsapp, r.ctr, r.intent]),
          ),
        ),
    },
    {
      label: "Origens e dispositivos",
      detail: "De onde vêm e como acessam",
      run: () =>
        download(
          `origens-${stamp}.csv`,
          toCsv(
            ["Tipo", "Item", "Período atual", "Período anterior"],
            [
              ...data.sources.map((s) => ["Origem", s.label, s.value, s.prev]),
              ...data.devices.map((s) => ["Dispositivo", s.label, s.value, s.prev]),
              ...data.pages.map((s) => ["Página", s.label, s.value, s.prev]),
              ...data.categories.map((s) => ["Categoria (cliques)", s.label, s.value, s.prev]),
              ...data.brands.map((s) => ["Marca (cliques)", s.label, s.value, s.prev]),
            ],
          ),
        ),
    },
  ];

  const topSource = data.sources[0];
  const bestDay = data.weekdays.reduce((a, b) => (b.value > a.value ? b : a), data.weekdays[0]);
  const topProduct = [...data.products].sort((a, b) => b.ml - a.ml)[0];
  const insights = [
    topSource && t.sessions > 0 && `${fmtPct(topSource.value / t.sessions)} das visitas vêm de ${topSource.label}.`,
    bestDay && bestDay.value > 0 && `${bestDay.label} é o dia com mais visitantes.`,
    topProduct && topProduct.ml > 0 && `Mais procurado: Cód. ${topProduct.code}, com ${fmtInt(topProduct.ml)} cliques em Comprar.`,
  ].filter(Boolean) as string[];

  return (
    <div className={`transition-opacity duration-300 ${pending ? "opacity-55" : ""}`}>
      {/* Header + filters (one row, scoping everything below) */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-[-0.02em] wdth-expanded sm:text-4xl">Visão geral</h1>
          <p className="mt-1 text-sm text-muted">
            {fmtDayLong(data.from)} a {fmtDayLong(data.to)} · comparado com {fmtDayLong(data.compareFrom)} a {fmtDayLong(data.prevDaily.at(-1)?.day ?? data.from)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div role="radiogroup" aria-label="Período" className="flex rounded-full bg-panel-2 p-1 ring-1 ring-white/[0.06]">
            {PERIODS.map((period) => {
              const active = data.period === period;
              return (
                <button
                  key={period}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPeriod(period)}
                  className={`relative rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${active ? "text-on-sign" : "text-led/70 hover:text-led"}`}
                >
                  {active && <motion.span layoutId="period-pill" className="absolute inset-0 rounded-full bg-sign" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative">{PERIOD_LABEL[period]}</span>
                </button>
              );
            })}
          </div>
          <div ref={exportRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              onClick={() => setExportOpen((v) => !v)}
              className="flex h-10 items-center gap-2 rounded-full bg-led px-4 text-sm font-black uppercase text-ink wdth-semi"
            >
              <DownloadSimple size={16} weight="bold" aria-hidden /> Exportar <CaretDown size={12} weight="bold" aria-hidden />
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-12 z-30 w-72 origin-top-right rounded-2xl bg-panel-3 p-1.5 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.95)] ring-1 ring-white/10"
                >
                  <p className="px-3 pb-1 pt-2 text-xs font-bold text-muted">Planilha (CSV para Excel)</p>
                  {exports.map((x) => (
                    <button
                      key={x.label}
                      role="menuitem"
                      type="button"
                      onClick={() => {
                        x.run();
                        setExportOpen(false);
                      }}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.06]"
                    >
                      <DownloadSimple size={18} className="mt-0.5 shrink-0 text-sign" aria-hidden />
                      <span>
                        <span className="block text-sm font-bold text-led">{x.label}</span>
                        <span className="block text-xs text-muted">{x.detail}</span>
                      </span>
                    </button>
                  ))}
                  <div className="my-1 h-px bg-white/[0.07]" />
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setExportOpen(false);
                      setTimeout(() => window.print(), 50);
                    }}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.06]"
                  >
                    <Printer size={18} className="mt-0.5 shrink-0 text-sign" aria-hidden />
                    <span>
                      <span className="block text-sm font-bold text-led">Relatório em PDF</span>
                      <span className="block text-xs text-muted">Imprimir ou salvar como PDF</span>
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {data.needsMigration && (
        <div className="mt-6 flex gap-3 rounded-2xl bg-sign/10 p-4 text-sm ring-1 ring-sign/30" role="status">
          <WarningCircle size={22} weight="fill" className="shrink-0 text-sign" aria-hidden />
          <p className="text-led">
            As métricas de visitas ainda não estão ativas. Rode o arquivo <code className="rounded bg-black/30 px-1">supabase/migrations/0002_security_hardening.sql</code> no SQL Editor do Supabase; a contagem começa logo depois.
          </p>
        </div>
      )}

      {/* Hero + KPIs */}
      <div className="mt-6 grid gap-3 lg:grid-cols-12">
        <section className="relative overflow-hidden rounded-2xl bg-sign p-6 text-on-sign lg:col-span-5 sm:p-7">
          <p className="text-sm font-bold text-black/70">Clientes enviados ao Mercado Livre</p>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-[3.6rem] font-black leading-[0.9] tracking-[-0.03em] wdth-semi">{fmtInt(t.ml)}</p>
            <span className="mb-1.5 rounded-full bg-black/10 px-2.5 py-1 [&_*]:!text-on-sign">
              <Delta value={delta(t.ml, p.ml)} />
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-black/70">cliques em &quot;Comprar no Mercado Livre&quot; · antes: {fmtInt(p.ml)}</p>
          <div className="mt-5 border-t border-black/15 pt-4">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.04em] text-black/60">
              <Lightning size={14} weight="fill" aria-hidden /> Destaques do período
            </p>
            {insights.length ? (
              <ul className="mt-2 space-y-1 text-sm font-semibold">
                {insights.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm font-medium text-black/70">Os destaques aparecem assim que a loja receber visitas.</p>
            )}
          </div>
        </section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
          <Kpi label="Visitantes" value={fmtInt(t.sessions)} change={delta(t.sessions, p.sessions)} hint="Sessões únicas na loja" />
          <Kpi label="Páginas vistas" value={fmtInt(t.pageviews)} change={delta(t.pageviews, p.pageviews)} />
          <Kpi label="Produtos vistos" value={fmtInt(t.views)} change={delta(t.views, p.views)} hint="Visualizações de páginas de produto" />
          <Kpi label="Cliques no WhatsApp" value={fmtInt(t.whatsapp)} change={delta(t.whatsapp, p.whatsapp)} />
          <Kpi label="Taxa de clique" value={t.views ? fmtPct(t.ctr) : "—"} change={p.ctr ? delta(t.ctr, p.ctr) : null} hint="Cliques em Comprar ÷ produtos vistos" />
          <Kpi label="Intenção de compra" value={fmtBrl(t.intent)} change={delta(t.intent, p.intent)} hint="Preço × cliques em Comprar. Estimativa: a venda acontece no Mercado Livre." />
        </div>
      </div>

      {/* Trend */}
      <Card
        className="mt-3"
        title="Evolução diária"
        subtitle={`${METRIC_LABEL[metric]} por dia`}
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="size-4 accent-[var(--color-sign)]" />
              Comparar com o anterior
            </label>
            <button
              type="button"
              onClick={() => setAsTable((v) => !v)}
              aria-pressed={asTable}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-led/80 ring-1 ring-white/[0.1] hover:bg-white/[0.05]"
            >
              {asTable ? <ChartLine size={16} aria-hidden /> : <Table size={16} aria-hidden />}
              {asTable ? "Ver gráfico" : "Ver tabela"}
            </button>
          </div>
        }
      >
        <div role="tablist" aria-label="Métrica do gráfico" className="-mx-1 mb-4 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] print:hidden">
          {CHART_METRICS.map((m) => {
            const active = metric === m;
            return (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setMetric(m)}
                className={`shrink-0 rounded-xl px-3 py-2 text-left transition-colors ${active ? "bg-white/[0.08] ring-1 ring-sign/50" : "hover:bg-white/[0.04]"}`}
              >
                <span className="block text-xs font-semibold text-muted">{METRIC_LABEL[m]}</span>
                <span className="block text-lg font-black tabular text-led wdth-semi">{fmtInt(t[m])}</span>
              </button>
            );
          })}
        </div>

        {asTable ? (
          <div className="max-h-80 overflow-auto rounded-xl ring-1 ring-white/[0.06]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-panel-2 text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Dia</th>
                  <th className="px-3 py-2 text-right font-semibold">{METRIC_LABEL[metric]}</th>
                  <th className="px-3 py-2 text-right font-semibold">Período anterior</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] tabular">
                {[...data.daily].reverse().map((d) => {
                  const i = data.daily.indexOf(d);
                  return (
                    <tr key={d.day}>
                      <td className="px-3 py-1.5 text-led/90">{fmtDay(d.day)}</td>
                      <td className="px-3 py-1.5 text-right font-bold text-led">{fmtInt(d[metric])}</td>
                      <td className="px-3 py-1.5 text-right text-muted">{fmtInt(data.prevDaily[i]?.[metric] ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <TrendChart current={data.daily} previous={data.prevDaily} metric={metric} label={METRIC_LABEL[metric]} showPrevious={compare} />
            {compare && (
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted" aria-hidden>
                <span className="flex items-center gap-2">
                  <span className="h-0.5 w-4 rounded-full bg-sign" /> Período atual
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-4 border-t-[1.5px] border-dashed border-[#8a8984]" /> Período anterior
                </span>
              </div>
            )}
          </>
        )}
      </Card>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card title="Funil de compra" subtitle="Quantos avançam até o Mercado Livre">
          <Funnel
            steps={[
              { label: "Visitantes", value: t.sessions, hint: "Pessoas que abriram a loja" },
              {
                label: "Produtos vistos",
                value: t.views,
                hint: "Páginas de produto abertas (cada visitante pode ver vários)",
                rate: t.sessions ? `${(t.views / t.sessions).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} produtos vistos por visitante` : null,
              },
              {
                label: "Cliques em Comprar",
                value: t.ml,
                hint: "Foram para o anúncio no Mercado Livre",
                rate: t.views ? `${fmtPct(t.ml / t.views)} das visualizações viraram clique em Comprar` : null,
              },
            ]}
          />
        </Card>
        <Card title="De onde vêm os visitantes" subtitle="Visitantes por origem">
          <BarList items={data.sources} unit="visitantes" empty="Sem visitas no período." />
        </Card>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Card title="Dispositivos" subtitle="Visitantes por tipo de aparelho">
          <BarList items={data.devices} unit="visitantes" empty="Sem visitas no período." />
        </Card>
        <Card title="Dias da semana" subtitle="Média de visitantes por dia">
          <ColumnChart items={data.weekdays} unit="visitantes" />
        </Card>
        <Card title="Páginas mais vistas" subtitle="Páginas vistas por seção">
          <BarList items={data.pages} unit="páginas vistas" empty="Sem visitas no período." />
        </Card>
      </div>

      <Card className="mt-3" title="Produtos" subtitle="Clique no cabeçalho para ordenar; no produto para editar">
        <ProductsTable rows={data.products} period={data.period} />
      </Card>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card title="Cliques por categoria" subtitle="Cliques em Comprar">
          <BarList items={data.categories} unit="cliques" empty="Sem cliques no período." />
        </Card>
        <Card title="Cliques por marca do celular" subtitle="Cliques em Comprar (um produto pode servir em várias marcas)">
          <BarList items={data.brands} unit="cliques" empty="Sem cliques no período." share={false} />
        </Card>
      </div>

      <Card
        className="mt-3"
        title="Saúde do catálogo"
        subtitle="O que dá para melhorar na vitrine"
        actions={
          <Link href="/admin/produtos/novo" className="plaque px-4 py-2 text-xs font-black uppercase wdth-semi print:hidden">
            <Plus size={14} weight="bold" aria-hidden /> Novo produto
          </Link>
        }
      >
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/[0.06] sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Publicados", data.health.published],
            ["Rascunhos", data.health.drafts],
            ["Esgotados", data.health.soldOut],
            ["Destaques", data.health.featured],
            ["Sem modelo", data.health.noModels],
            ["Sem categoria", data.health.noCategory],
          ].map(([label, value]) => (
            <div key={label} className="bg-panel-2 p-4">
              <dt className="text-xs font-semibold text-muted">{label}</dt>
              <dd className="mt-1 text-2xl font-black tabular text-led wdth-semi">{fmtInt(value as number)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5">
          <h3 className="text-sm font-bold text-led">Sem nenhuma visualização no período</h3>
          {data.health.stale.length ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {data.health.stale.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/produtos/${r.id}`} className="tag tag-hole tag-shape flex items-center gap-2 py-1.5 pr-3 text-sm font-semibold hover:text-sign">
                    Cód. {r.code} · {r.title.length > 28 ? `${r.title.slice(0, 28)}…` : r.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-muted">Todos os produtos publicados foram vistos pelo menos uma vez. Boa!</p>
          )}
          <p className="mt-3 text-xs text-faint">
            Dica: destaque um produto parado para levá-lo ao topo da página inicial.{" "}
            <Link href="/admin/produtos" className="inline-flex items-center gap-1 font-bold text-sign print:hidden">
              Ver produtos <ArrowRight size={12} weight="bold" aria-hidden />
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
