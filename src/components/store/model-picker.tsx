"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { groupModels, modelSlug } from "@/lib/models";

type Props = {
  models: string[];
  /** how many plaques per brand before "ver todos" */
  limit?: number;
  hrefBase?: string;
  activeModel?: string | null;
  onPick?: (model: string) => void;
  title?: string;
};

/** "Qual é o seu celular?": brand tabs + model plaques. */
export function ModelPicker({ models, limit = 9, hrefBase = "/produtos", activeModel = null, onPick, title = "Qual é o seu celular?" }: Props) {
  const groups = useMemo(() => groupModels(models), [models]);
  const [brand, setBrand] = useState(groups[0]?.brand ?? "Apple");
  const current = groups.find((g) => g.brand === brand) ?? groups[0];

  if (!groups.length) return null;

  return (
    <div>
      <h2 className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-black uppercase leading-[0.95] tracking-[-0.025em] wdth-expanded">{title}</h2>

      <div role="tablist" aria-label="Marca do celular" className="mt-5 flex flex-wrap gap-1.5">
        {groups.map((g) => {
          const selected = g.brand === current.brand;
          return (
            <button
              key={g.brand}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setBrand(g.brand)}
              className={`relative rounded-full px-4 py-2 text-sm font-bold transition-colors duration-300 ${
                selected ? "text-on-sign" : "text-led/75 hover:text-led"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="brand-pill"
                  className="absolute inset-0 rounded-full bg-sign"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{g.brand}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={`Modelos ${current.brand}`} className="mt-4 min-h-[7.5rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.ul
            key={current.brand}
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {current.models.slice(0, limit).map((model) => {
              const active = activeModel === modelSlug(model);
              const cls = `tag-shape flex items-center gap-2 py-2 pr-3.5 text-[0.9rem] font-semibold transition-[background-color,color,transform] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 ${
                active ? "plaque plaque-hole font-bold" : "tag tag-hole hover:text-sign"
              }`;
              const inner = model;
              return (
                <li key={model}>
                  {onPick ? (
                    <button type="button" className={cls} aria-pressed={active} onClick={() => onPick(model)}>
                      {inner}
                    </button>
                  ) : (
                    <Link href={`${hrefBase}?modelo=${modelSlug(model)}`} className={cls}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
            {!onPick && current.models.length > limit && (
              <li>
                <Link
                  href="/produtos#modelos"
                  className="flex items-center gap-1.5 rounded-[0.5rem] px-3 py-2 text-[0.9rem] font-bold text-sign underline decoration-sign/40 hover:decoration-sign"
                >
                  +{current.models.length - limit} modelos <ArrowRight size={14} weight="bold" aria-hidden />
                </Link>
              </li>
            )}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}
