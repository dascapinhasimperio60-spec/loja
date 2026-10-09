"use client";

import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Plus, PencilSimple, ArrowUp, ArrowDown, Star, Eye, EyeSlash, Prohibit, ImageSquare } from "@phosphor-icons/react";
import { reorderProducts, setProductFlag } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import { useToast } from "./toast";
import type { Category, Product } from "@/lib/types";

type Filter = "todos" | "publicados" | "rascunhos" | "esgotados" | "destaques";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "publicados", label: "Publicados" },
  { value: "rascunhos", label: "Rascunhos" },
  { value: "destaques", label: "Destaques" },
  { value: "esgotados", label: "Esgotados" },
];

type Flag = "active" | "featured" | "sold_out";

export function ProductList({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");

  const [items, applyOptimistic] = useOptimistic(
    products,
    (state, action: { type: "flag"; id: string; field: Flag; value: boolean } | { type: "order"; ids: string[] }) => {
      if (action.type === "flag") return state.map((p) => (p.id === action.id ? { ...p, [action.field]: action.value } : p));
      const map = new Map(state.map((p) => [p.id, p]));
      return action.ids.map((id) => map.get(id)!).filter(Boolean);
    },
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      if (filter === "publicados" && !p.active) return false;
      if (filter === "rascunhos" && p.active) return false;
      if (filter === "esgotados" && !p.sold_out) return false;
      if (filter === "destaques" && !p.featured) return false;
      if (q && !`${p.title} ${p.code} ${p.models.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filter, query]);

  const canReorder = filter === "todos" && !query.trim();

  function toggle(p: Product, field: Flag) {
    const value = !p[field];
    startTransition(async () => {
      applyOptimistic({ type: "flag", id: p.id, field, value });
      const res = await setProductFlag({ id: p.id, field, value });
      if (!res.ok) toast("error", res.error);
      else toast("ok", field === "active" ? (value ? "Publicado na loja." : "Escondido da loja.") : field === "featured" ? (value ? "Agora é destaque." : "Saiu dos destaques.") : value ? "Marcado como esgotado." : "Voltou ao estoque.");
      router.refresh();
    });
  }

  function move(index: number, delta: number) {
    const ids = items.map((p) => p.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    startTransition(async () => {
      applyOptimistic({ type: "order", ids });
      const res = await reorderProducts(ids);
      if (!res.ok) toast("error", res.error);
      router.refresh();
    });
  }

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "Sem categoria";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-[-0.02em] wdth-expanded">Produtos</h1>
          <p className="mt-1 text-muted tabular">
            {items.filter((p) => p.active).length} publicados · {items.filter((p) => !p.active).length} rascunhos
          </p>
        </div>
        <Link href="/admin/produtos/novo" className="plaque hidden px-5 py-3 text-sm font-black uppercase wdth-semi sm:inline-flex">
          <Plus size={18} weight="bold" aria-hidden /> Novo produto
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar produto</span>
          <MagnifyingGlass size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, código ou modelo"
            className="h-11 w-full rounded-full bg-panel-2 pl-11 pr-4 text-led ring-1 ring-white/[0.08] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sign"
          />
        </label>
        <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${filter === f.value ? "bg-sign text-on-sign" : "bg-panel-2 text-led/75 hover:text-led"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="slatwall mt-8 rounded-[1.5rem] px-6 py-16 text-center ring-1 ring-white/[0.05]">
          <ImageSquare size={44} className="mx-auto text-sign" aria-hidden />
          <h2 className="mt-4 text-2xl font-black uppercase wdth-expanded">A parede está vazia</h2>
          <p className="mx-auto mt-2 max-w-[42ch] text-muted">
            Cadastre o primeiro produto: tire as fotos, coloque o preço e cole o link do anúncio no Mercado Livre. Leva uns 2 minutos.
          </p>
          <Link href="/admin/produtos/novo" className="plaque mt-6 px-6 py-3 font-black uppercase wdth-semi">
            <Plus size={18} weight="bold" aria-hidden /> Cadastrar primeiro produto
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-panel ring-1 ring-white/[0.06]">
          {visible.map((p) => {
            const index = items.findIndex((x) => x.id === p.id);
            const cover = p.images[0];
            return (
              <li key={p.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                {canReorder && (
                  <div className="hidden flex-col sm:flex">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="flex size-7 items-center justify-center rounded-md text-led/60 hover:bg-white/[0.06] hover:text-led disabled:opacity-20" aria-label={`Subir ${p.title}`}>
                      <ArrowUp size={14} weight="bold" aria-hidden />
                    </button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="flex size-7 items-center justify-center rounded-md text-led/60 hover:bg-white/[0.06] hover:text-led disabled:opacity-20" aria-label={`Descer ${p.title}`}>
                      <ArrowDown size={14} weight="bold" aria-hidden />
                    </button>
                  </div>
                )}
                <Link href={`/admin/produtos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-panel-3 ring-1 ring-white/[0.06] sm:size-[4.5rem]">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover.thumb_url} alt="" className={`size-full object-cover ${p.active ? "" : "opacity-50 grayscale"}`} loading="lazy" />
                    ) : (
                      <ImageSquare size={22} className="absolute inset-0 m-auto text-faint" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{p.title}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
                      <span className="tabular">Cód. {p.code}</span>
                      <span className="tabular font-semibold text-led">{formatPrice(p.price)}</span>
                      <span className="hidden sm:inline">{catName(p.category_id)}</span>
                      <span className="tabular">{p.click_count} cliques</span>
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {!p.active && <span className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[0.7rem] font-bold uppercase text-led/80">Rascunho</span>}
                      {p.featured && <span className="rounded-md bg-sign/15 px-1.5 py-0.5 text-[0.7rem] font-bold uppercase text-sign">Destaque</span>}
                      {p.sold_out && <span className="rounded-md bg-danger/15 px-1.5 py-0.5 text-[0.7rem] font-bold uppercase text-danger">Esgotado</span>}
                    </span>
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-0.5">
                  <IconToggle on={p.active} onClick={() => toggle(p, "active")} label={p.active ? "Esconder da loja" : "Publicar"} icon={p.active ? <Eye size={18} aria-hidden /> : <EyeSlash size={18} aria-hidden />} />
                  <IconToggle on={p.featured} onClick={() => toggle(p, "featured")} label={p.featured ? "Tirar dos destaques" : "Destacar"} icon={<Star size={18} weight={p.featured ? "fill" : "regular"} aria-hidden />} className="hidden sm:flex" />
                  <IconToggle on={p.sold_out} onClick={() => toggle(p, "sold_out")} label={p.sold_out ? "Voltou ao estoque" : "Marcar esgotado"} icon={<Prohibit size={18} aria-hidden />} danger className="hidden sm:flex" />
                  <Link href={`/admin/produtos/${p.id}`} className="flex size-10 items-center justify-center rounded-full text-led/70 hover:bg-white/[0.06] hover:text-led" aria-label={`Editar ${p.title}`}>
                    <PencilSimple size={18} aria-hidden />
                  </Link>
                </div>
              </li>
            );
          })}
          {visible.length === 0 && <li className="p-10 text-center text-muted">Nenhum produto com esse filtro.</li>}
        </ul>
      )}
    </div>
  );
}

function IconToggle({ on, onClick, label, icon, danger = false, className = "" }: { on: boolean; onClick: () => void; label: string; icon: React.ReactNode; danger?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={on}
      className={`flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06] ${on ? (danger ? "text-danger" : "text-sign") : "text-led/45 hover:text-led"} ${className}`}
    >
      {icon}
    </button>
  );
}
