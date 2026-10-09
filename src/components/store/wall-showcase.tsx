"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { ProductHang } from "./product-hang";
import { ShelfCell } from "./shelf-cell";
import { brandOf, type Brand } from "@/lib/models";
import type { Product } from "@/lib/types";

/** A slatwall section with brand tabs: the store wall, filtered. */
export function WallShowcase({ products, limit = 8 }: { products: Product[]; limit?: number }) {
  const brands = useMemo(() => {
    const set = new Set<Brand>();
    products.forEach((p) => p.models.forEach((m) => set.add(brandOf(m))));
    return Array.from(set);
  }, [products]);

  const [brand, setBrand] = useState<Brand | "Tudo">("Tudo");
  const visible = useMemo(
    () => (brand === "Tudo" ? products : products.filter((p) => p.models.some((m) => brandOf(m) === brand))).slice(0, limit),
    [brand, products, limit],
  );

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <h2 className="text-[clamp(2.2rem,5.4vw,4.6rem)] font-black uppercase leading-[0.88] tracking-[-0.03em] wdth-expanded">
          Acabou de
          <br />
          chegar na parede
        </h2>
        {brands.length > 1 && (
          <div role="tablist" aria-label="Filtrar por marca" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
            {(["Tudo", ...brands] as const).map((b) => {
              const selected = b === brand;
              return (
                <button
                  key={b}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setBrand(b)}
                  className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300 ${selected ? "text-on-sign" : "text-led/75 hover:text-led"}`}
                >
                  {selected && (
                    <motion.span layoutId="wall-pill" className="absolute inset-0 rounded-full bg-sign" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  <span className="relative">{b}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="slatwall relative mt-10 overflow-hidden rounded-[1.5rem] px-4 pb-10 pt-0 ring-1 ring-white/[0.05] sm:px-8 lg:px-10">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 pt-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p, i) => (
            <ShelfCell key={p.id} index={i}>
              <ProductHang product={p} index={i} />
            </ShelfCell>
          ))}
        </ul>
        {visible.length === 0 && <p className="py-16 text-center text-muted">Nada dessa marca na parede ainda.</p>}
        <div className="mt-10 flex justify-center">
          <Link
            href={brand === "Tudo" ? "/produtos" : `/produtos?marca=${brand.toLowerCase()}`}
            className="group flex items-center gap-3 whitespace-nowrap rounded-full bg-led py-2 pl-6 pr-2 text-sm font-black uppercase text-ink transition-transform duration-300 wdth-semi active:scale-[0.98] sm:text-base"
          >
            Ver a vitrine completa
            <span className="flex size-10 items-center justify-center rounded-full bg-ink text-sign transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
              <ArrowRight size={18} weight="bold" aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
