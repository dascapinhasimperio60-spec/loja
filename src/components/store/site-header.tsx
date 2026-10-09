"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { List, X, WhatsappLogo, ArrowUpRight } from "@phosphor-icons/react";
import { Wordmark } from "./wordmark";
import { whatsappLink } from "@/lib/format";

const NAV = [
  { href: "/produtos", label: "Vitrine" },
  { href: "/produtos#modelos", label: "Por modelo" },
  { href: "/#assistencia", label: "Assistência" },
  { href: "/#loja", label: "A loja" },
];

export function SiteHeader({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const wa = whatsappLink(whatsapp, "Olá! Vim pelo site da Império das Capinhas.");

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-500 ease-[var(--ease-out-expo)] ${
        scrolled || open ? "bg-ink/92 shadow-[0_1px_0_rgba(255,255,255,0.06),0_18px_40px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md" : "bg-ink"
      }`}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="shrink-0 rounded-lg" aria-label="Império das Capinhas, página inicial" onClick={() => setOpen(false)}>
          <Wordmark compact />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-[0.95rem] font-semibold text-led/80 transition-colors duration-300 hover:bg-white/[0.06] hover:text-led"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="group hidden items-center gap-2 rounded-full border border-sign/40 py-1.5 pl-3.5 pr-1.5 text-sm font-bold text-sign transition-colors duration-300 hover:border-sign hover:bg-sign hover:text-on-sign sm:flex"
          >
            <WhatsappLogo size={18} weight="fill" aria-hidden />
            WhatsApp
            <span className="flex size-7 items-center justify-center rounded-full bg-sign/12 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:bg-black/10">
              <ArrowUpRight size={14} weight="bold" aria-hidden />
            </span>
          </a>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-full text-led md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={26} aria-hidden /> : <List size={26} aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            className="fixed inset-x-0 bottom-0 top-[4.25rem] z-40 flex flex-col bg-ink/97 px-6 pb-10 pt-6 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <nav aria-label="Menu" className="flex flex-col">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ y: 28, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.05 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-white/[0.07] py-5 text-4xl font-black uppercase tracking-[-0.02em] wdth-expanded"
                  >
                    {item.label}
                    <ArrowUpRight size={22} className="text-sign" aria-hidden />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="plaque mt-auto justify-center py-4 text-lg font-black uppercase wdth-semi"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1, transition: { delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
            >
              <WhatsappLogo size={24} weight="fill" aria-hidden /> Chamar no WhatsApp
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
