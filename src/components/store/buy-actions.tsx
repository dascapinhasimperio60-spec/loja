"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, WhatsappLogo, ShieldCheck, Truck, BellRinging } from "@phosphor-icons/react";
import { PricePlaque } from "./price-plaque";
import { trackClick } from "@/lib/track";
import { whatsappLink } from "@/lib/format";
import type { Product } from "@/lib/types";

type Props = { product: Product; whatsapp: string; pageUrl: string };

/** The one action that matters: buy on Mercado Livre. Plus WhatsApp. */
export function BuyActions({ product, whatsapp, pageUrl }: Props) {
  const anchor = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  const { scrollY } = useScroll();
  // Show the sticky bar only after the main button has scrolled above the fold.
  useStickyBar(scrollY, anchor, setShowBar);

  const waText = product.sold_out
    ? `Olá! O produto Cód. ${product.code} (${product.title}) está esgotado no site. Vai chegar de novo? ${pageUrl}`
    : `Olá! Tenho uma dúvida sobre o produto Cód. ${product.code}: ${product.title}. ${pageUrl}`;
  const wa = whatsappLink(whatsapp, waText);
  const canBuy = !product.sold_out && Boolean(product.ml_url);

  const buyButton = (compact = false) =>
    canBuy ? (
      <a
        href={product.ml_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(product.id, "ml")}
        className={`group relative flex items-center justify-between gap-3 overflow-hidden rounded-full bg-sign font-black uppercase text-on-sign shadow-[0_18px_40px_-14px_rgba(255,204,41,0.6)] wdth-semi transition-transform duration-300 active:scale-[0.985] ${
          compact ? "py-1.5 pl-5 pr-1.5 text-sm" : "py-2 pl-5 pr-2 text-[0.92rem] sm:py-2.5 sm:pl-7 sm:pr-2.5 sm:text-lg"
        }`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/40 opacity-0 transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-[420%] group-hover:opacity-100"
        />
        <span className="relative whitespace-nowrap">{compact ? "Comprar no ML" : "Comprar no Mercado Livre"}</span>
        <span
          className={`relative flex shrink-0 items-center justify-center rounded-full bg-ink text-sign transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${
            compact ? "size-9" : "size-11 sm:size-12"
          }`}
        >
          <ArrowUpRight size={compact ? 16 : 20} weight="bold" aria-hidden />
        </span>
      </a>
    ) : (
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(product.id, "whatsapp")}
        className={`flex items-center justify-between gap-3 rounded-full bg-led font-black uppercase text-ink wdth-semi ${compact ? "py-1.5 pl-5 pr-1.5 text-sm" : "py-2.5 pl-7 pr-2.5 text-lg"}`}
      >
        {product.sold_out ? "Avise-me quando chegar" : "Pedir pelo WhatsApp"}
        <span className={`flex items-center justify-center rounded-full bg-ink text-led ${compact ? "size-9" : "size-12"}`}>
          <BellRinging size={compact ? 16 : 20} weight="bold" aria-hidden />
        </span>
      </a>
    );

  return (
    <>
      <div ref={anchor} className="space-y-4">
        {buyButton()}
        {canBuy && (
          <p className="px-2 text-sm leading-relaxed text-muted">
            Você vai para o nosso anúncio no <strong className="font-bold text-led">Mercado Livre</strong> e finaliza a compra por lá, com
            pagamento e entrega pela plataforma.
          </p>
        )}
        {product.sold_out && (
          <p className="px-2 text-sm leading-relaxed text-muted">Este item acabou na loja. Chame no WhatsApp que avisamos quando chegar.</p>
        )}
        <ul className="grid grid-cols-2 gap-2 pt-1 text-[0.82rem] font-semibold text-led/85">
          <li className="flex items-center gap-2 rounded-xl bg-panel-2 px-3 py-2.5 ring-1 ring-white/[0.06]">
            <ShieldCheck size={20} weight="fill" className="shrink-0 text-sign" aria-hidden /> Compra Garantida do Mercado Livre
          </li>
          <li className="flex items-center gap-2 rounded-xl bg-panel-2 px-3 py-2.5 ring-1 ring-white/[0.06]">
            <Truck size={20} weight="fill" className="shrink-0 text-sign" aria-hidden /> Envio para todo o Brasil
          </li>
        </ul>
        {!product.sold_out && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(product.id, "whatsapp")}
            className="flex items-center justify-center gap-2 rounded-full py-3 text-base font-bold text-led ring-1 ring-white/[0.12] transition-colors hover:bg-white/[0.05] hover:ring-white/25"
          >
            <WhatsappLogo size={20} weight="fill" className="text-sign" aria-hidden />
            Tirar dúvida no WhatsApp
          </a>
        )}
      </div>

      {/* mobile sticky bar once the main button scrolls away */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-ink/94 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="flex items-center gap-3">
              <PricePlaque price={product.price} compareAt={product.compare_at_price} size="sm" tilt={0} className="shrink-0" />
              <div className="min-w-0 flex-1">
                {buyButton(true)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function useStickyBar(
  scrollY: ReturnType<typeof useScroll>["scrollY"],
  anchor: React.RefObject<HTMLDivElement | null>,
  set: (v: boolean) => void,
) {
  useMotionValueEvent(scrollY, "change", () => {
    const el = anchor.current;
    if (!el) return;
    set(el.getBoundingClientRect().bottom < 0);
  });
}
