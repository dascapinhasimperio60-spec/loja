import Link from "next/link";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { getCatalog } from "@/lib/catalog";
import { whatsappLink } from "@/lib/format";
import { SignPlate } from "@/components/store/sign-plate";
import { ModelPicker } from "@/components/store/model-picker";
import { HookRail } from "@/components/store/hook-rail";
import { LedStrip } from "@/components/store/led-shelf";
import { WallShowcase } from "@/components/store/wall-showcase";
import { BuyPath } from "@/components/store/buy-path";
import { StoreVisit } from "@/components/store/store-visit";
import { TrackVisit } from "@/components/store/track-visit";

export default async function HomePage() {
  const { products, settings, demo } = await getCatalog();

  const featured = (products.filter((p) => p.featured && !p.sold_out).length
    ? products.filter((p) => p.featured && !p.sold_out)
    : products
  ).slice(0, 4);
  const newest = [...products].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const models = Array.from(new Set(products.flatMap((p) => p.models)));

  return (
    <>
      <TrackVisit page="home" />
      {/* ---------------------------------------------------------------- */}
      {/* The sign + the rail: first viewport                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-[1400px] overflow-x-clip px-4 pt-5 sm:px-6 sm:pt-8 lg:px-10">
        <SignPlate instagram={settings.instagram} whatsapp={settings.whatsapp} tagline={settings.tagline} />

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-4 lg:pt-2">
            <ModelPicker models={models} limit={6} />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/produtos"
                className="group flex items-center gap-3 rounded-full bg-sign py-2 pl-6 pr-2 text-base font-black uppercase text-on-sign shadow-[0_14px_34px_-12px_rgba(255,204,41,0.55)] transition-transform duration-300 wdth-semi active:scale-[0.98]"
              >
                Ver a vitrine
                <span className="flex size-10 items-center justify-center rounded-full bg-ink text-sign transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                  <ArrowRight size={18} weight="bold" aria-hidden />
                </span>
              </Link>
              <p className="max-w-[24ch] text-sm leading-snug text-muted">Compra segura pelo Mercado Livre. {settings.announcement}.</p>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-8">
            <LedStrip className="mb-7 px-[4%]" />
            <HookRail products={featured} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The wall                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto mt-24 max-w-[1400px] px-4 sm:mt-32 sm:px-6 lg:px-10">
        <WallShowcase products={newest} />
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How buying works                                                 */}
      {/* ---------------------------------------------------------------- */}
      <section className="mx-auto mt-28 max-w-[1400px] px-4 sm:mt-40 sm:px-6 lg:px-10" aria-labelledby="como-comprar">
        <div className="grid gap-6 lg:grid-cols-12">
          <h2 id="como-comprar" className="text-[clamp(2.2rem,5.4vw,4.6rem)] font-black uppercase leading-[0.88] tracking-[-0.03em] wdth-expanded lg:col-span-7">
            Da vitrine
            <br />
            até a sua porta
          </h2>
          <p className="max-w-[44ch] self-end text-lg leading-relaxed text-muted lg:col-span-5">
            Você escolhe com as nossas fotos e finaliza no Mercado Livre, que cuida do pagamento e da entrega.
          </p>
        </div>
        <div className="mt-14 sm:mt-20">
          <BuyPath />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Repair                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section id="assistencia" className="mx-auto mt-28 max-w-[1400px] scroll-mt-24 px-4 sm:mt-40 sm:px-6 lg:px-10">
        <div className="grid gap-6 rounded-[1.75rem] bg-panel-2 p-8 ring-1 ring-white/[0.06] sm:p-10 lg:grid-cols-12 lg:items-end lg:p-14">
          <h2 className="text-[clamp(2rem,4.6vw,3.9rem)] font-black uppercase leading-[0.9] tracking-[-0.03em] wdth-expanded lg:col-span-7">
            Celular quebrou?
          </h2>
          <div className="min-w-0 lg:col-span-5">
            <p className="max-w-[40ch] text-lg leading-relaxed text-muted">
              A gente também faz assistência técnica. Mande o modelo e o problema que respondemos com o orçamento.
            </p>
            <a
              href={whatsappLink(settings.whatsapp, "Olá! Meu celular precisa de assistência técnica. Modelo: ")}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex max-w-full items-center gap-3 rounded-full bg-sign py-2 pl-5 pr-2 text-sm font-black uppercase text-on-sign wdth-semi sm:text-base transition-transform active:scale-[0.98]"
            >
              <WhatsappLogo size={22} weight="fill" aria-hidden />
              <span className="min-w-0">Pedir orçamento</span>
              <span className="flex size-10 items-center justify-center rounded-full bg-ink text-sign transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                <ArrowRight size={18} weight="bold" aria-hidden />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* The physical store                                               */}
      {/* ---------------------------------------------------------------- */}
      <section id="loja" className="mx-auto mt-28 max-w-[1400px] scroll-mt-24 px-4 sm:mt-40 sm:px-6 lg:px-10">
        <StoreVisit settings={settings} demo={demo} />
      </section>
    </>
  );
}
