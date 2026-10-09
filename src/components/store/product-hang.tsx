"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useSpring } from "motion/react";
import { Hook } from "./hook";
import { PricePlaque } from "./price-plaque";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  index?: number;
  priority?: boolean;
  /** "wall" hangs from its own peg; "rail" hangs from a shared bar above. */
  mount?: "wall" | "rail";
};

function modelsLabel(models: string[]) {
  if (!models.length) return "";
  return models.length > 1 ? `${models[0]} +${models.length - 1}` : models[0];
}

/**
 * A product hanging on a hook. It swings into rest when it enters the view
 * and gets nudged by the pointer, like a blister pack on a store peg.
 */
export function ProductHang({ product, index = 0, priority = false, mount = "wall" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduce = useReducedMotion();
  const rotate = useSpring(0, { stiffness: 150, damping: 5.5, mass: 0.9 });

  useEffect(() => {
    if (!inView || reduce) return;
    const dir = index % 2 === 0 ? 1 : -1;
    rotate.jump(dir * (6 + (index % 3) * 2));
    const t = setTimeout(() => rotate.set(0), 40 + (index % 6) * 70);
    return () => clearTimeout(t);
  }, [inView, reduce, index, rotate]);

  function nudge(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse") return;
    const dir = e.movementX >= 0 ? 1 : -1;
    rotate.set(dir * 4.5);
    setTimeout(() => rotate.set(0), 90);
  }

  const [cover, alt] = product.images;
  const tilt = ((product.code % 5) - 2) * 1.4;

  return (
    <motion.article
      ref={ref}
      onPointerEnter={nudge}
      style={{ rotate, transformOrigin: "50% 0" }}
      className="group relative pt-6"
    >
      <Hook className={`absolute left-1/2 z-10 -translate-x-1/2 ${mount === "rail" ? "-top-3" : "top-0"}`} />
      <Link
        href={`/produto/${product.slug}`}
        className="block overflow-hidden rounded-[var(--radius-card)] bg-panel-2 shadow-[0_24px_40px_-24px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.06] transition-[box-shadow] duration-500 group-hover:shadow-[0_34px_60px_-26px_rgba(0,0,0,1)] group-hover:ring-white/[0.12] focus-visible:outline-offset-4"
      >
        <div className="hang-tab max-sm:h-[3rem]" aria-hidden />
        <div className="relative aspect-[4/5] overflow-hidden bg-panel-3">
          {cover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover.thumb_url}
                alt={product.title}
                width={cover.width || 640}
                height={cover.height || 800}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
              />
              {alt && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={alt.thumb_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 grid place-items-center text-sm text-faint">Sem foto</div>
          )}
          {product.sold_out && (
            <div className="absolute inset-0 grid place-items-center bg-ink/55 backdrop-grayscale">
              <span className="-rotate-6 rounded-md border-2 border-led/80 px-3 py-1 text-sm font-black uppercase tracking-[0.08em] text-led wdth-semi">
                Esgotado
              </span>
            </div>
          )}
        </div>
        <div className="px-3.5 pb-4 pt-3 sm:px-4">
          <span className="tabular inline-block whitespace-nowrap rounded bg-white/[0.06] px-1.5 py-0.5 text-[0.72rem] font-bold text-led/85">
            Cód. {product.code}
          </span>
          <h3 className="mt-1.5 text-[0.95rem] sm:line-clamp-3 font-bold leading-[1.25] text-led sm:text-base">{product.title}</h3>
          {product.models.length > 0 && (
            <p className="mt-1.5 text-[0.78rem] font-semibold leading-snug text-sign/90">{modelsLabel(product.models)}</p>
          )}
        </div>
      </Link>
      <PricePlaque
        price={product.price}
        compareAt={product.compare_at_price}
        size="sm"
        tilt={tilt}
        className="pointer-events-none absolute left-1/2 top-[calc(1.5rem+1.3rem)] origin-top -translate-x-1/2 scale-[0.86] sm:left-auto sm:right-3 sm:top-[calc(1.5rem+2.1rem)] sm:translate-x-0 sm:origin-top-right sm:scale-100"
      />
    </motion.article>
  );
}
