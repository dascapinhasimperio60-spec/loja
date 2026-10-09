import Link from "next/link";
import { WhatsappLogo, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { Wordmark } from "./wordmark";
import { formatPhone, whatsappLink } from "@/lib/format";
import type { Category, Settings } from "@/lib/types";

export function SiteFooter({ settings, categories }: { settings: Settings; categories: Category[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-white/[0.06] bg-[#080809]">
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-16 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark />
            <p className="mt-5 max-w-[38ch] text-muted">
              {settings.tagline}. {settings.announcement}.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={whatsappLink(settings.whatsapp, "Olá! Vim pelo site da Império das Capinhas.")}
                target="_blank"
                rel="noopener noreferrer"
                className="plaque plaque-hole px-3.5 py-2.5 text-sm font-black"
              >
                <WhatsappLogo size={18} weight="fill" aria-hidden /> {formatPhone(settings.whatsapp)}
              </a>
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-[var(--radius-plaque)] bg-panel-2 px-3.5 py-2.5 text-sm font-bold ring-1 ring-white/[0.08] transition-shadow hover:ring-sign/50"
              >
                <InstagramLogo size={18} weight="fill" aria-hidden /> @{settings.instagram}
              </a>
            </div>
          </div>

          <nav aria-label="Vitrine" className="md:col-span-3">
            <h2 className="text-sm font-black uppercase tracking-[0.06em] text-led wdth-semi">Vitrine</h2>
            <ul className="mt-4 space-y-2.5 text-muted">
              <li>
                <Link href="/produtos" className="transition-colors hover:text-led">
                  Todos os produtos
                </Link>
              </li>
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link href={`/produtos?categoria=${c.slug}`} className="transition-colors hover:text-led">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="text-sm font-black uppercase tracking-[0.06em] text-led wdth-semi">Como comprar</h2>
            <p className="mt-4 max-w-[40ch] text-muted">
              Os pedidos são finalizados no Mercado Livre: pagamento, parcelamento e entrega ficam por lá. Dúvidas, atacado e assistência
              técnica: fale com a gente no WhatsApp.
            </p>
            {settings.address && <p className="mt-4 text-muted">{settings.address}</p>}
            {settings.opening_hours && <p className="mt-1 text-muted">{settings.opening_hours}</p>}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-white/[0.06] pt-6 text-sm text-faint sm:flex-row sm:justify-between">
          <p>
            © {year} {settings.store_name}. Todos os direitos reservados.
          </p>
          <p>Compras processadas pelo Mercado Livre.</p>
        </div>
      </div>
    </footer>
  );
}
