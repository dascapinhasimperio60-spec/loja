"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ShieldCheck } from "@phosphor-icons/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Stop 1: the price plaque from the wall. */
function PlaqueObject() {
  return (
    <span className="plaque plaque-hole px-3.5 py-2.5 text-lg font-black tracking-[-0.02em] wdth-semi" style={{ rotate: "-3deg" }}>
      Cód. 101
    </span>
  );
}

/** Stop 2: the payment ticket. */
function TicketObject() {
  return (
    <span
      className="relative flex items-center gap-2 rounded-t-md bg-led px-3.5 pb-3.5 pt-2.5 text-sm font-black uppercase text-ink wdth-semi"
      style={{
        rotate: "2deg",
        // torn paper edge
        maskImage: "linear-gradient(#000 0 0), radial-gradient(circle at 6px 100%, transparent 5px, #000 5.5px)",
        maskSize: "100% calc(100% - 6px), 12px 6px",
        maskPosition: "top, bottom",
        maskRepeat: "no-repeat, repeat-x",
        WebkitMaskImage: "linear-gradient(#000 0 0), radial-gradient(circle at 6px 100%, transparent 5px, #000 5.5px)",
        WebkitMaskSize: "100% calc(100% - 6px), 12px 6px",
        WebkitMaskPosition: "top, bottom",
        WebkitMaskRepeat: "no-repeat, repeat-x",
      }}
    >
      <ShieldCheck size={18} weight="fill" aria-hidden /> Pago no Mercado Livre
    </span>
  );
}

/** Stop 3: the shipping label on the box. */
function LabelObject() {
  return (
    <span className="flex items-stretch gap-3 rounded-md bg-panel-3 p-1.5 ring-1 ring-white/10" style={{ rotate: "-1.5deg" }}>
      <span className="rounded-[0.3rem] bg-led px-2.5 py-1.5 text-ink">
        <span className="block text-[0.62rem] font-bold uppercase leading-none tracking-[0.08em]">Envio</span>
        <span className="block text-sm font-black uppercase leading-tight wdth-semi">Todo o Brasil</span>
      </span>
      <span
        aria-hidden
        className="w-10 rounded-[0.2rem] bg-led"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, #0b0b0c 0 2px, transparent 2px 4px, #0b0b0c 4px 5px, transparent 5px 8px)" }}
      />
    </span>
  );
}

const STOPS = [
  {
    object: PlaqueObject,
    title: "Escolha na vitrine",
    text: "Fotos do nosso estoque, preço na plaquinha e a lista de modelos compatíveis em cada produto.",
  },
  {
    object: TicketObject,
    title: "Pague no Mercado Livre",
    text: "O botão leva ao nosso anúncio. Pagamento, parcelamento e frete ficam por conta do Mercado Livre, com a Compra Garantida deles.",
  },
  {
    object: LabelObject,
    title: "Receba em casa",
    text: "Enviamos para todo o Brasil. Prefere ver pessoalmente? Temos loja física: veja abaixo.",
  },
];

/** One continuous yellow line carries the purchase from the shelf to the door. */
export function BuyPath() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduce = useReducedMotion();
  const on = reduce || inView;

  return (
    <div ref={ref} className="relative">
      {/* desktop: horizontal line through the stops */}
      <div className="absolute left-0 right-0 top-[2.4rem] hidden h-[3px] rounded-full bg-white/[0.08] md:block" aria-hidden>
        <motion.div
          className="h-full origin-left rounded-full bg-sign shadow-[0_0_10px_rgba(255,204,41,0.65)]"
          initial={false}
          animate={{ scaleX: on ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 1.8, ease: EASE }}
        />
      </div>
      {/* mobile: vertical line */}
      <div className="absolute bottom-10 left-[1.1rem] top-10 w-[3px] rounded-full bg-white/[0.08] md:hidden" aria-hidden>
        <motion.div
          className="h-full origin-top rounded-full bg-sign shadow-[0_0_10px_rgba(255,204,41,0.65)]"
          initial={false}
          animate={{ scaleY: on ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 1.8, ease: EASE }}
        />
      </div>

      <ol className="relative grid gap-12 md:grid-cols-3 md:gap-8">
        {STOPS.map(({ object: Obj, title, text }, i) => (
          <li key={title} className="relative pl-12 md:pl-0">
            <span className="absolute left-[0.55rem] top-[1.7rem] size-4 rounded-full bg-ink ring-[3px] ring-sign md:hidden" aria-hidden />
            <motion.div
              className="flex h-[4.8rem] items-center"
              initial={false}
              animate={on ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0.35, y: 10, filter: "blur(2px)" }}
              transition={{ duration: 0.7, ease: EASE, delay: reduce ? 0 : 0.25 + i * 0.55 }}
            >
              <Obj />
            </motion.div>
            <h3 className="mt-4 text-xl font-black uppercase tracking-[-0.015em] wdth-semi sm:text-2xl">{title}</h3>
            <p className="mt-2 max-w-[34ch] text-[0.98rem] leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
