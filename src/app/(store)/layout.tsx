import { getCatalog } from "@/lib/catalog";
import { LedTicker } from "@/components/store/led-ticker";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { SmoothScroll } from "@/components/store/smooth-scroll";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const { settings, categories, demo } = await getCatalog();

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-md bg-sign px-4 py-2 font-bold text-on-sign focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <LedTicker
        items={[settings.announcement, "Compra segura pelo Mercado Livre", "Atacado e varejo", "Referência em capas Apple", "Assistência técnica"].filter(Boolean)}
      />
      {demo && (
        <p className="bg-panel-2 px-4 py-2 text-center text-xs font-semibold text-led/75">
          Vitrine de demonstração: os produtos reais aparecem aqui quando forem cadastrados no painel.
        </p>
      )}
      <SiteHeader whatsapp={settings.whatsapp} />
      <main id="conteudo">{children}</main>
      <SiteFooter settings={settings} categories={categories} />
      <SmoothScroll />
    </>
  );
}
