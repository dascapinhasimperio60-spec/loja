"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CaretDown, CaretUp, MagnifyingGlass, DownloadSimple, ImageSquare } from "@phosphor-icons/react";
import type { ProductRow } from "@/lib/analytics-types";
import { delta, fmtBrl, fmtInt, fmtPct } from "@/lib/number-format";
import { download, toCsv } from "@/lib/export-csv";
import { Delta } from "./delta";

type Key = "title" | "views" | "ml" | "whatsapp" | "ctr" | "intent";
const COLS: { key: Key; label: string; numeric: boolean; hint?: string }[] = [
  { key: "title", label: "Produto", numeric: false },
  { key: "views", label: "Vistos", numeric: true, hint: "Visualizações da página do produto" },
  { key: "ml", label: "Comprar", numeric: true, hint: "Cliques em Comprar no Mercado Livre" },
  { key: "whatsapp", label: "WhatsApp", numeric: true },
  { key: "ctr", label: "Taxa", numeric: true, hint: "Cliques em Comprar ÷ visualizações" },
  { key: "intent", label: "Intenção", numeric: true, hint: "Preço × cliques em Comprar (estimativa, não é venda)" },
];

export function ProductsTable({ rows, period }: { rows: ProductRow[]; period: number }) {
  const [sort, setSort] = useState<{ key: Key; dir: "asc" | "desc" }>({ key: "ml", dir: "desc" });
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(12);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter((r) => !q || `${r.title} ${r.code} ${r.category} ${r.brands.join(" ")}`.toLowerCase().includes(q));
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) =>
      sort.key === "title" ? a.title.localeCompare(b.title, "pt-BR") * dir : ((a[sort.key] as number) - (b[sort.key] as number)) * dir || b.views - a.views,
    );
  }, [rows, query, sort]);

  function toggle(key: Key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "title" ? "asc" : "desc" }));
  }

  function exportCsv() {
    download(
      `produtos-${period}d.csv`,
      toCsv(
        ["Código", "Produto", "Categoria", "Marcas", "Preço", "Visualizações", "Cliques Comprar", "Cliques WhatsApp", "Taxa de clique", "Intenção (R$)", "Publicado", "Esgotado", "Destaque"],
        filtered.map((r) => [r.code, r.title, r.category, r.brands.join(", "), r.price, r.views, r.ml, r.whatsapp, r.ctr, r.intent, r.active ? "sim" : "não", r.sold_out ? "sim" : "não", r.featured ? "sim" : "não"]),
      ),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Buscar produto</span>
          <MagnifyingGlass size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, código, categoria ou marca"
            className="h-10 w-full rounded-full bg-panel-2 pl-10 pr-4 text-sm text-led ring-1 ring-white/[0.08] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sign"
          />
        </label>
        <button
          type="button"
          onClick={exportCsv}
          className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold text-led ring-1 ring-white/[0.12] transition-colors hover:bg-white/[0.05] print:hidden"
        >
          <DownloadSimple size={16} aria-hidden /> CSV
        </button>
      </div>

      {/* phones: cards + sort select (a wide table breaks the mobile viewport) */}
      <div className="mt-4 sm:hidden">
        <label className="mb-3 flex items-center gap-2 text-sm text-muted">
          Ordenar por
          <select
            value={sort.key}
            onChange={(e) => setSort({ key: e.target.value as Key, dir: e.target.value === "title" ? "asc" : "desc" })}
            className="rounded-full bg-panel-2 px-3 py-1.5 font-semibold text-led ring-1 ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-sign"
          >
            {COLS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <ul className="divide-y divide-white/[0.06]">
          {filtered.slice(0, limit).map((r) => (
            <li key={r.id}>
              <Link href={`/admin/produtos/${r.id}`} className="flex gap-3 py-3">
                <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-panel-3">
                  {r.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumb} alt="" className="size-full object-cover" loading="lazy" />
                  ) : (
                    <ImageSquare size={16} className="text-faint" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-led">{r.title}</span>
                  <span className="text-xs text-muted tabular">
                    Cód. {r.code}
                    {!r.active && " · rascunho"}
                    {r.sold_out && " · esgotado"}
                  </span>
                  <span className="mt-1.5 grid grid-cols-4 gap-2 text-xs">
                    {[
                      ["Vistos", fmtInt(r.views)],
                      ["Comprar", fmtInt(r.ml)],
                      ["WhatsApp", fmtInt(r.whatsapp)],
                      ["Taxa", r.views ? fmtPct(r.ctr) : "—"],
                    ].map(([label, value]) => (
                      <span key={label}>
                        <span className="block text-faint">{label}</span>
                        <span className={`block font-bold tabular ${label === "Comprar" ? "text-led" : "text-led/85"}`}>{value}</span>
                      </span>
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {filtered.length === 0 && <li className="py-10 text-center text-muted">Nenhum produto encontrado.</li>}
        </ul>
      </div>

      <div className="mt-4 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-white/[0.07] text-left text-xs text-muted">
              {COLS.map((c) => {
                const active = sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    className={`py-2.5 font-semibold ${c.numeric ? "text-right" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(c.key)}
                      title={c.hint}
                      className={`inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-led ${active ? "text-led" : ""}`}
                    >
                      {c.label}
                      {active ? sort.dir === "asc" ? <CaretUp size={12} weight="bold" aria-hidden /> : <CaretDown size={12} weight="bold" aria-hidden /> : null}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filtered.slice(0, limit).map((r) => (
              <tr key={r.id} className="group transition-colors hover:bg-white/[0.025]">
                <td className="py-2.5 pr-3">
                  <Link href={`/admin/produtos/${r.id}`} className="flex min-w-0 items-center gap-3">
                    <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-panel-3">
                      {r.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.thumb} alt="" className="size-full object-cover" loading="lazy" />
                      ) : (
                        <ImageSquare size={16} className="text-faint" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-[22rem] truncate font-bold text-led group-hover:text-sign">{r.title}</span>
                      <span className="text-xs text-muted tabular">
                        Cód. {r.code} · {r.category}
                        {!r.active && " · rascunho"}
                        {r.sold_out && " · esgotado"}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="py-2.5 text-right tabular text-led/90">{fmtInt(r.views)}</td>
                <td className="py-2.5 text-right tabular">
                  <span className="font-black text-led">{fmtInt(r.ml)}</span>
                  <span className="ml-1.5 inline-block w-14 text-left"><Delta value={delta(r.ml, r.prev_ml)} compact /></span>
                </td>
                <td className="py-2.5 text-right tabular text-led/90">{fmtInt(r.whatsapp)}</td>
                <td className="py-2.5 text-right tabular text-led/90">{r.views ? fmtPct(r.ctr) : "—"}</td>
                <td className="py-2.5 pr-1 text-right tabular text-led/90">{r.intent ? fmtBrl(r.intent) : "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={COLS.length} className="py-10 text-center text-muted">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > limit && (
        <button type="button" onClick={() => setLimit((l) => l + 20)} className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-led/80 ring-1 ring-white/[0.08] hover:bg-white/[0.03] print:hidden">
          Mostrar mais ({filtered.length - limit})
        </button>
      )}
    </div>
  );
}
