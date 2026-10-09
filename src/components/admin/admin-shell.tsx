"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  SquaresFour,
  Package,
  Tag,
  Storefront,
  ArrowSquareOut,
  SignOut,
  Plus,
  List,
  X,
  SidebarSimple,
  CaretUpDown,
} from "@phosphor-icons/react";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { ToastProvider } from "./toast";

type Item = { href: string; label: string; short?: string; icon: typeof SquaresFour; exact?: boolean; badge?: number };

const STORAGE_KEY = "imperio:sidebar";
const EASE = [0.16, 1, 0.3, 1] as const;

function initials(email: string) {
  const name = email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim();
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "L") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")).toUpperCase();
}

export function AdminShell({ children, email, storeUrl, publishedCount }: { children: React.ReactNode; email: string; storeUrl: string; publishedCount: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const groups: { title: string; items: Item[] }[] = [
    { title: "Geral", items: [{ href: "/admin", label: "Visão geral", short: "Início", icon: SquaresFour, exact: true }] },
    {
      title: "Catálogo",
      items: [
        { href: "/admin/produtos", label: "Produtos", icon: Package, badge: publishedCount },
        { href: "/admin/categorias", label: "Categorias", icon: Tag },
      ],
    },
    { title: "Loja", items: [{ href: "/admin/configuracoes", label: "Dados da loja", short: "Loja", icon: Storefront }] },
  ];
  const flat = groups.flatMap((g) => g.items);

  const isActive = (item: Item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href) && !pathname.startsWith("/admin/produtos/novo");

  // remember the collapsed state (per browser)
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "collapsed");
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? "expanded" : "collapsed");
      } catch {}
      return !c;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  useEffect(() => {
    setDrawer(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !menuRef.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const nav = (compact: boolean, idPrefix: string) => (
    <LayoutGroup id={idPrefix}>
      <nav aria-label="Painel" className="space-y-6">
        {groups.map((g) => (
          <div key={g.title}>
            <p className={`mb-1.5 px-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-faint transition-opacity ${compact ? "opacity-0" : "opacity-100"}`} aria-hidden={compact}>
              {g.title}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <li key={item.href} className="group/item relative">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      aria-label={compact ? item.label : undefined}
                      className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] font-semibold transition-colors ${
                        active ? "text-led" : "text-led/60 hover:bg-white/[0.04] hover:text-led"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId={`${idPrefix}-active`}
                          className="absolute inset-0 rounded-xl bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                          transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        />
                      )}
                      <Icon size={20} weight={active ? "fill" : "regular"} className={`relative shrink-0 ${active ? "text-sign" : ""}`} aria-hidden />
                      {!compact && <span className="relative truncate">{item.label}</span>}
                      {!compact && item.badge !== undefined && item.badge > 0 && (
                        <span className="relative ml-auto rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[0.7rem] font-bold tabular text-led/70">{item.badge}</span>
                      )}
                    </Link>
                    {compact && (
                      <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-panel-3 px-2.5 py-1.5 text-xs font-bold text-led opacity-0 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.9)] ring-1 ring-white/10 transition-opacity group-hover/item:opacity-100">
                        {item.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </LayoutGroup>
  );

  const storeCard = (compact: boolean) =>
    compact ? (
      <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="group/item relative mx-auto flex size-11 items-center justify-center rounded-xl text-led/70 hover:bg-white/[0.05] hover:text-led" aria-label="Ver a loja (abre em nova aba)">
        <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-ok shadow-[0_0_8px_rgba(127,220,154,0.8)]" aria-hidden />
        <ArrowSquareOut size={20} aria-hidden />
      </a>
    ) : (
      <a
        href={storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-2xl bg-panel-2 p-3.5 ring-1 ring-white/[0.06] transition-colors hover:ring-white/[0.14]"
      >
        <span className="flex items-center gap-2 text-xs font-bold text-led">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok/60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-ok" />
          </span>
          Loja no ar
        </span>
        <span className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
          <span className="truncate">{storeUrl.replace(/^https?:\/\//, "")}</span>
          <ArrowSquareOut size={14} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </span>
      </a>
    );

  const profile = (compact: boolean) => (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenu((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menu}
        aria-label={compact ? `Conta: ${email}` : undefined}
        className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.05] ${compact ? "justify-center" : ""}`}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sign text-xs font-black text-on-sign">{initials(email)}</span>
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-led">Lojista</span>
              <span className="block truncate text-xs text-muted">{email}</span>
            </span>
            <CaretUpDown size={16} className="shrink-0 text-muted" aria-hidden />
          </>
        )}
      </button>
      <AnimatePresence>
        {menu && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: EASE }}
            className={`absolute bottom-full z-50 mb-2 w-60 rounded-2xl bg-panel-3 p-1.5 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.95)] ring-1 ring-white/10 ${compact ? "left-0" : "inset-x-0 w-auto"}`}
          >
            <p className="truncate px-3 pb-1.5 pt-2 text-xs text-muted">{email}</p>
            <a role="menuitem" href={storeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-led hover:bg-white/[0.06]">
              <ArrowSquareOut size={18} aria-hidden /> Ver a loja
            </a>
            <button role="menuitem" type="button" onClick={signOut} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10">
              <SignOut size={18} aria-hidden /> Sair
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <ToastProvider>
      <div className="lg:flex lg:min-h-dvh">
        {/* Desktop sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 84 : 272 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="relative hidden shrink-0 border-r border-white/[0.06] bg-[#08080a] lg:block print:hidden"
        >
          <div className="sticky top-0 flex h-dvh flex-col gap-6 overflow-y-auto overflow-x-hidden px-4 py-5 [scrollbar-width:none]">
            <div className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between"}`}>
              <Link href="/admin" className="flex items-center gap-2.5 rounded-lg" aria-label="Império das Capinhas: visão geral">
                <Image src="/brand/mark.webp" alt="" width={217} height={354} className="h-9 w-auto shrink-0" />
                {!collapsed && (
                  <span className="flex flex-col leading-[0.85]">
                    <span className="text-[1rem] font-black uppercase tracking-[-0.02em] wdth-expanded">Império</span>
                    <span className="text-[0.66rem] font-extrabold italic uppercase text-sign wdth-semi">painel do lojista</span>
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={toggle}
                className="flex size-9 items-center justify-center rounded-lg text-led/60 transition-colors hover:bg-white/[0.06] hover:text-led"
                aria-label={collapsed ? "Expandir menu (Ctrl+B)" : "Recolher menu (Ctrl+B)"}
                title={collapsed ? "Expandir (Ctrl+B)" : "Recolher (Ctrl+B)"}
              >
                <SidebarSimple size={20} aria-hidden />
              </button>
            </div>

            <Link
              href="/admin/produtos/novo"
              aria-label={collapsed ? "Novo produto" : undefined}
              className={`plaque justify-center text-sm font-black uppercase wdth-semi ${collapsed ? "mx-auto size-11 !gap-0 p-0" : "py-3"}`}
            >
              <Plus size={18} weight="bold" aria-hidden /> {!collapsed && "Novo produto"}
            </Link>

            {nav(collapsed, "desk")}

            <div className="mt-auto space-y-3">
              {storeCard(collapsed)}
              <div className="border-t border-white/[0.06] pt-3">{profile(collapsed)}</div>
            </div>
          </div>
        </motion.aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-ink/90 px-3 backdrop-blur-md lg:hidden print:hidden">
          <button type="button" onClick={() => setDrawer(true)} className="flex size-10 items-center justify-center rounded-full text-led" aria-label="Abrir menu" aria-expanded={drawer}>
            <List size={24} aria-hidden />
          </button>
          <Link href="/admin" className="flex items-center gap-2" aria-label="Visão geral">
            <Image src="/brand/mark.webp" alt="" width={217} height={354} className="h-7 w-auto" />
            <span className="text-sm font-black uppercase wdth-expanded">Império</span>
          </Link>
          <span className="grid size-9 place-items-center rounded-full bg-sign text-xs font-black text-on-sign" aria-hidden>
            {initials(email)}
          </span>
        </header>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawer && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
              <motion.aside
                role="dialog"
                aria-modal="true"
                aria-label="Menu do painel"
                className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,86vw)] flex-col gap-6 overflow-y-auto bg-[#08080a] px-4 pb-6 pt-4 shadow-[24px_0_60px_-20px_rgba(0,0,0,0.9)] lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <Image src="/brand/mark.webp" alt="" width={217} height={354} className="h-9 w-auto" />
                    <span className="flex flex-col leading-[0.85]">
                      <span className="text-[1rem] font-black uppercase wdth-expanded">Império</span>
                      <span className="text-[0.66rem] font-extrabold italic uppercase text-sign wdth-semi">painel do lojista</span>
                    </span>
                  </span>
                  <button type="button" onClick={() => setDrawer(false)} className="flex size-10 items-center justify-center rounded-full text-led" aria-label="Fechar menu">
                    <X size={22} aria-hidden />
                  </button>
                </div>
                <Link href="/admin/produtos/novo" className="plaque justify-center py-3 text-sm font-black uppercase wdth-semi">
                  <Plus size={18} weight="bold" aria-hidden /> Novo produto
                </Link>
                {nav(false, "drawer")}
                <div className="mt-auto space-y-3">
                  {storeCard(false)}
                  <div className="border-t border-white/[0.06] pt-3">{profile(false)}</div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-9 print:p-0">{children}</main>

        {/* Mobile bottom nav */}
        <nav
          aria-label="Atalhos"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/[0.08] bg-ink/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden print:hidden"
        >
          {[flat[0], flat[1]].map((item) => (
            <MobileTab key={item.href} item={item} active={isActive(item)} />
          ))}
          <Link href="/admin/produtos/novo" className="flex items-center justify-center" aria-label="Novo produto">
            <span className="plaque flex size-12 items-center justify-center !rounded-full">
              <Plus size={24} weight="bold" aria-hidden />
            </span>
          </Link>
          {[flat[2], flat[3]].map((item) => (
            <MobileTab key={item.href} item={item} active={isActive(item)} />
          ))}
        </nav>
      </div>
    </ToastProvider>
  );
}

function MobileTab({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} aria-current={active ? "page" : undefined} className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-bold ${active ? "text-sign" : "text-led/55"}`}>
      {active && <motion.span layoutId="mobile-tab" className="absolute top-0 h-0.5 w-8 rounded-full bg-sign" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
      <Icon size={22} weight={active ? "fill" : "regular"} aria-hidden />
      {item.short ?? item.label}
    </Link>
  );
}
