import Image from "next/image";
import { MapPin, Clock, InstagramLogo, ArrowUpRight, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { whatsappLink } from "@/lib/format";
import type { Settings } from "@/lib/types";

const PHOTOS = [
  { src: "/brand/loja-corredor.webp", alt: "Corredor da loja com paredes cheias de capinhas penduradas", w: 1280, h: 720, cls: "col-span-6 row-span-2 sm:col-span-4" },
  { src: "/brand/loja-parede-apple.webp", alt: "Parede de capinhas de silicone para iPhone em dezenas de cores", w: 720, h: 1280, cls: "col-span-3 row-span-3 sm:col-span-2" },
  { src: "/brand/loja-balcao.webp", alt: "Balcão com capinhas premium e acessórios iluminados por LED", w: 1280, h: 720, cls: "col-span-3 row-span-1 sm:col-span-2" },
  { src: "/brand/loja-parede-capinhas.webp", alt: "Prateleiras com capinhas coloridas e garrafas térmicas", w: 1280, h: 720, cls: "col-span-6 row-span-1 sm:col-span-2" },
];

/** The physical store: real photos, address, hours, Instagram. */
export function StoreVisit({ settings, demo }: { settings: Settings; demo: boolean }) {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="min-w-0 lg:col-span-5 lg:pt-4">
        <h2 className="text-[clamp(2.2rem,5vw,4.4rem)] font-black uppercase leading-[0.9] tracking-[-0.03em] wdth-expanded">
          Uma parede inteira de capinhas.
          <span className="mt-2 block text-sign">De verdade.</span>
        </h2>
        <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted">
          Somos loja física: {settings.tagline.toLowerCase()}.{" "}
          {demo ? "Aqui você vai ver as fotos do nosso estoque." : "As fotos deste site são do nosso estoque."} Referência em capas
          Apple, com opções para Samsung, Motorola, Xiaomi e muito mais.
        </p>

        <dl className="mt-8 divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {settings.address && (
            <div className="flex gap-4 py-4">
              <dt className="pt-0.5 text-sign">
                <MapPin size={22} weight="fill" aria-label="Endereço" />
              </dt>
              <dd className="text-led">
                {settings.address}
                {settings.maps_url && (
                  <a
                    href={settings.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 flex items-center gap-1 text-sm font-bold text-sign underline decoration-sign/40 hover:decoration-sign"
                  >
                    Como chegar <ArrowUpRight size={14} weight="bold" aria-hidden />
                  </a>
                )}
              </dd>
            </div>
          )}
          {(!settings.address || !settings.opening_hours) && (
            <div className="flex gap-4 py-4">
              <dt className="pt-0.5 text-sign">
                <WhatsappLogo size={22} weight="fill" aria-label="Endereço e horário" />
              </dt>
              <dd className="text-led">
                {!settings.address && !settings.opening_hours ? "Endereço e horário" : !settings.address ? "Endereço" : "Horário"}: pergunte no{" "}
                <a
                  href={whatsappLink(settings.whatsapp, "Olá! Qual o endereço e o horário da loja?")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sign underline decoration-sign/40 hover:decoration-sign"
                >
                  WhatsApp
                </a>
              </dd>
            </div>
          )}
          {settings.opening_hours && (
            <div className="flex gap-4 py-4">
              <dt className="pt-0.5 text-sign">
                <Clock size={22} weight="fill" aria-label="Horário" />
              </dt>
              <dd className="text-led">{settings.opening_hours}</dd>
            </div>
          )}
          <div className="flex gap-4 py-4">
            <dt className="pt-0.5 text-sign">
              <InstagramLogo size={22} weight="fill" aria-label="Instagram" />
            </dt>
            <dd>
              <a
                href={`https://instagram.com/${settings.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-led underline decoration-white/25 hover:decoration-sign"
              >
                @{settings.instagram}
              </a>
              <span className="ml-2 text-muted">mais de 22 mil seguidores</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="min-w-0 lg:col-span-7">
        <div className="grid auto-rows-[7.5rem] grid-cols-9 gap-2.5 sm:auto-rows-[9.5rem] sm:grid-cols-6 sm:gap-3 lg:auto-rows-[10.5rem]">
          {PHOTOS.map((p) => (
            <figure key={p.src} className={`group relative overflow-hidden rounded-[var(--radius-card)] bg-panel-2 ring-1 ring-white/[0.06] ${p.cls}`}>
              <Image
                src={p.src}
                alt={p.alt}
                width={p.w}
                height={p.h}
                loading="lazy"
                className="size-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
