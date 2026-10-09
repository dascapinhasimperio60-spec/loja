"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, X, SortAscending } from "@phosphor-icons/react";
import { ProductHang } from "./product-hang";
import { ModelPicker } from "./model-picker";
import { ShelfCell } from "./shelf-cell";
import { brandOf, modelSlug } from "@/lib/models";
import type { Category, Product } from "@/lib/types";

type Sort = "destaques" | "menor-preco" | "maior-preco" | "novidades";

const SORTS: { value: Sort; label: string }[] = [
  { value: "destaques", label: "Destaques" },
  { value: "novidades", label: "Novidades" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
];

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function CatalogBrowser({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const modelo = params.get("modelo");
  const marca = params.get("marca");
  const categoria = params.get("categoria");
  const ordem = (params.get("ordem") as Sort) || "destaques";
  const [query, setQuery] = useState(params.get("q") ?? "");

  const allModels = useMemo(() => Array.from(new Set(products.flatMap((p) => p.models))), [products]);
  const modelName = modelo ? allModels.find((m) => modelSlug(m) === modelo) : null;

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "modelo" && value) next.delete("marca");
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }

  const results = useMemo(() => {
    const q = normalize(query.trim());
    let list = products.filter((p) => {
      if (modelo && !p.models.some((m) => modelSlug(m) === modelo)) return false;
      if (marca && !p.models.some((m) => brandOf(m).toLowerCase() === marca)) return false;
      if (categoria) {
        const cat = categories.find((c) => c.slug === categoria);
        if (cat && p.category_id !== cat.id) return false;
      }
      if (q) {
        const hay = normalize(`${p.title} ${p.code} ${p.models.join(" ")} ${p.material}`);
        if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (ordem === "menor-preco") return a.price - b.price;
      if (ordem === "maior-preco") return b.price - a.price;
      if (ordem === "novidades") return b.created_at.localeCompare(a.created_at);
      return Number(b.featured) - Number(a.featured) || a.position - b.position;
    });
    // sold out goes to the end, but stays visible
    return [...list.filter((p) => !p.sold_out), ...list.filter((p) => p.sold_out)];
  }, [products, categories, modelo, marca, categoria, ordem, query]);

  const activeFilters = [
    modelName && { key: "modelo", label: modelName },
    marca && { key: "marca", label: marca.charAt(0).toUpperCase() + marca.slice(1) },
    categoria && { key: "categoria", label: categories.find((c) => c.slug === categoria)?.name ?? categoria },
  ].filter(Boolean) as { key: string; label: string }[];

  const usedCategories = categories.filter((c) => products.some((p) => p.category_id === c.id));

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
      {/* Filters */}
      <aside className="min-w-0 lg:col-span-4 xl:col-span-3">
        <div className="space-y-9 lg:sticky lg:top-24">
          <label className="relative block">
            <span className="sr-only">Buscar produto, modelo ou código</span>
            <MagnifyingGlass size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onBlur={() => setParam("q", query.trim() || null)}
              placeholder="Buscar produto, modelo ou código"
              className="h-13 w-full rounded-full bg-panel-2 pl-12 pr-4 text-base text-led ring-1 ring-white/[0.08] transition-shadow placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sign"
            />
          </label>

          <div id="modelos" className="scroll-mt-28">
            <ModelPicker
              models={allModels}
              limit={40}
              title="Seu celular"
              activeModel={modelo}
              onPick={(m) => setParam("modelo", modelSlug(m) === modelo ? null : modelSlug(m))}
            />
          </div>

          {usedCategories.length > 1 && (
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.06em] wdth-semi">Categoria</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {usedCategories.map((c) => {
                  const active = categoria === c.slug;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setParam("categoria", active ? null : c.slug)}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors ${
                        active ? "bg-sign text-on-sign ring-sign" : "bg-panel-2 text-led/85 ring-white/[0.08] hover:ring-sign/50"
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Results */}
      <div className="min-w-0 lg:col-span-8 xl:col-span-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-muted" aria-live="polite">
            <span className="font-bold text-led tabular">{results.length}</span> {results.length === 1 ? "produto" : "produtos"}
            {modelName && (
              <>
                {" "}
                para <span className="font-bold text-led">{modelName}</span>
              </>
            )}
          </p>
          <label className="flex items-center gap-2 text-sm text-muted">
            <SortAscending size={18} aria-hidden />
            <span className="sr-only">Ordenar por</span>
            <select
              value={ordem}
              onChange={(e) => setParam("ordem", e.target.value === "destaques" ? null : e.target.value)}
              className="rounded-full bg-panel-2 px-3 py-2 font-semibold text-led ring-1 ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-sign"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setParam(f.key, null)}
                className="plaque plaque-hole py-1.5 pl-2.5 pr-2 text-sm font-bold"
                aria-label={`Remover filtro ${f.label}`}
              >
                {f.label}
                <X size={14} weight="bold" aria-hidden />
              </button>
            ))}
          </div>
        )}

        <div className="slatwall relative mt-6 overflow-hidden rounded-[1.5rem] px-4 pb-10 ring-1 ring-white/[0.05] sm:px-6 lg:px-8">
          {results.length ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-6 pt-8 sm:gap-x-6 md:grid-cols-3">
              {results.map((p, i) => (
                <ShelfCell key={p.id} index={i}>
                  <ProductHang product={p} index={i} priority={i < 4} />
                </ShelfCell>
              ))}
            </ul>
          ) : (
            <div className="py-24 text-center">
              <p className="text-2xl font-black uppercase wdth-semi">Gancho vazio</p>
              <p className="mx-auto mt-2 max-w-[40ch] text-muted">
                Não achamos nada com esses filtros. Tente outro modelo ou chame no WhatsApp: talvez esteja na loja e ainda não no site.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  startTransition(() => router.replace(pathname, { scroll: false }));
                }}
                className="mt-6 rounded-full bg-led px-5 py-2.5 font-bold text-ink"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
