"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SquaresFour, Package, Tag, GearSix, ArrowSquareOut, SignOut, Plus } from "@phosphor-icons/react";
import { Wordmark } from "@/components/store/wordmark";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { ToastProvider } from "./toast";

const NAV = [
  { href: "/admin", label: "Painel", icon: SquaresFour, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package, exact: false },
  { href: "/admin/categorias", label: "Categorias", icon: Tag, exact: false },
  { href: "/admin/configuracoes", label: "Loja", icon: GearSix, exact: false },
];

export function AdminShell({ children, email, storeUrl }: { children: React.ReactNode; email: string; storeUrl: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const isActive = (href: string, exact: boolean) => (exact ? pathname === href : pathname.startsWith(href) && !pathname.startsWith("/admin/produtos/novo"));

  const mobileLink = ({ href, label, icon: Icon, exact }: (typeof NAV)[number]) => {
    const active = isActive(href, exact);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex flex-col items-center gap-0.5 py-2.5 text-[0.7rem] font-bold ${active ? "text-sign" : "text-led/60"}`}
      >
        <Icon size={22} weight={active ? "fill" : "regular"} aria-hidden />
        {label}
      </Link>
    );
  };

  return (
    <ToastProvider>
      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_1fr]">
        <aside className="hidden border-r border-white/[0.06] bg-[#080809] lg:block">
          <div className="sticky top-0 flex h-dvh flex-col p-5">
            <Link href="/admin" className="rounded-lg px-1 py-2">
              <Wordmark compact />
            </Link>
            <Link href="/admin/produtos/novo" className="plaque mt-6 justify-center py-2.5 text-sm font-black uppercase wdth-semi">
              <Plus size={18} weight="bold" aria-hidden /> Novo produto
            </Link>
            <nav aria-label="Painel" className="mt-6 flex flex-col gap-1">
              {NAV.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-semibold transition-colors ${
                      active ? "bg-white/[0.08] text-led" : "text-led/65 hover:bg-white/[0.04] hover:text-led"
                    }`}
                  >
                    <Icon size={20} weight={active ? "fill" : "regular"} className={active ? "text-sign" : ""} aria-hidden />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto space-y-1 border-t border-white/[0.06] pt-4">
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-led/65 hover:bg-white/[0.04] hover:text-led"
              >
                <ArrowSquareOut size={20} aria-hidden /> Ver a loja
              </a>
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-led/65 hover:bg-white/[0.04] hover:text-led"
              >
                <SignOut size={20} aria-hidden /> Sair
              </button>
              <p className="truncate px-3 pt-2 text-xs text-faint">{email}</p>
            </div>
          </div>
        </aside>

        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-ink/95 px-4 backdrop-blur lg:hidden">
          <Link href="/admin" aria-label="Painel">
            <Wordmark compact />
          </Link>
          <div className="flex items-center gap-1">
            <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full text-led/80" aria-label="Ver a loja">
              <ArrowSquareOut size={20} aria-hidden />
            </a>
            <button type="button" onClick={signOut} className="flex size-10 items-center justify-center rounded-full text-led/80" aria-label="Sair">
              <SignOut size={20} aria-hidden />
            </button>
          </div>
        </header>

        <main className="min-w-0 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10">{children}</main>

        <nav
          aria-label="Painel"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/[0.08] bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          {NAV.slice(0, 2).map(mobileLink)}
          <Link href="/admin/produtos/novo" className="flex items-center justify-center" aria-label="Novo produto">
            <span className="plaque flex size-12 items-center justify-center rounded-full">
              <Plus size={24} weight="bold" aria-hidden />
            </span>
          </Link>
          {NAV.slice(2).map(mobileLink)}
        </nav>
      </div>
    </ToastProvider>
  );
}
