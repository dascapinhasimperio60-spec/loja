import Image from "next/image";
import { SignSheen } from "./sign-sheen";
import { formatPhone } from "@/lib/format";

const BRANDS = ["Apple", "Samsung", "Motorola", "Xiaomi", "Realme", "LG", "Asus"];

function Chars({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) =>
        ch === " " ? (
          <span key={i}> </span>
        ) : (
          <span key={i} className="sign-char" style={{ "--i": i + offset } as React.CSSProperties} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </>
  );
}

/**
 * The storefront lightbox, rebuilt: yellow acrylic, black lettering with the
 * white outline, the white brand band and the contact strip.
 */
export function SignPlate({ instagram, whatsapp, tagline }: { instagram: string; whatsapp: string; tagline: string }) {
  return (
    <div className="relative">
      {/* light spilling onto the dark wall below the sign */}
      <div
        aria-hidden
        className="sign-power-glow pointer-events-none absolute -inset-x-8 -bottom-28 top-1/3 rounded-[50%] bg-sign/35 blur-[100px]"
      />
      <SignSheen>
        <div className="rounded-[0.85rem] bg-[linear-gradient(180deg,#56565c_0%,#2c2c31_30%,#1a1a1d_100%)] p-[5px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.25)] sm:rounded-[1.1rem] sm:p-[7px]">
        <div className="relative overflow-hidden rounded-[0.55rem] bg-sign-off ring-1 ring-black/50 sm:rounded-[0.75rem]">
          {/* lit acrylic */}
          <div
            aria-hidden
            className="sign-power absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_30%,#ffe07a_0%,var(--color-sign)_45%,var(--color-sign-deep)_100%)] shadow-[inset_0_3px_0_rgba(255,255,255,0.55),inset_0_14px_24px_-12px_rgba(255,255,255,0.6)]"
          />
          <div className="relative grid grid-cols-[auto_1fr] items-center gap-3 px-4 pb-4 pt-5 sm:gap-6 sm:px-8 sm:pb-6 sm:pt-8 lg:px-12 lg:pt-10">
            <Image
              src="/brand/mark.webp"
              alt=""
              width={217}
              height={354}
              priority
              className="sign-power h-[clamp(5.5rem,15vw,13rem)] w-auto drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]"
            />
            <div className="min-w-0">
              <h1 className="leading-[0.86]">
                <span className="sr-only">Império das Capinhas: capinhas e acessórios para celular</span>
                <span className="sign-letter block font-black uppercase tracking-[-0.035em] wdth-expanded text-[clamp(2.6rem,10vw,9rem)]">
                  <Chars text="Império" />
                </span>
                <span className="sign-letter block font-extrabold italic uppercase tracking-[-0.025em] wdth-semi text-[clamp(1.55rem,6.15vw,5.5rem)]">
                  <Chars text="das capinhas" offset={7} />
                </span>
              </h1>
              <p className="sign-char mt-2 text-[clamp(0.62rem,1.5vw,1.2rem)] font-extrabold italic uppercase tracking-[0.01em] text-on-sign wdth-semi" style={{ "--i": 19 } as React.CSSProperties}>
                {tagline}
              </p>
            </div>
          </div>

          {/* white brand band, as on the storefront */}
          <div className="relative border-y border-black/10 bg-[#fbfbf7]">
            <ul className="flex items-center justify-between gap-4 overflow-hidden px-4 py-2 text-[clamp(0.7rem,1.4vw,1.15rem)] font-black uppercase tracking-[-0.01em] text-black/80 sm:px-8 lg:px-12" aria-label="Marcas atendidas">
              {BRANDS.map((b, i) => (
                <li key={b} className={`whitespace-nowrap ${i >= 5 ? "hidden sm:block" : ""}`}>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2.5 text-on-sign sm:px-8 sm:py-3 lg:px-12">
            <span className="text-[clamp(0.72rem,1.4vw,1.1rem)] font-extrabold">@{instagram}</span>
            <span className="text-[clamp(0.85rem,1.9vw,1.6rem)] font-black tabular tracking-[-0.02em] wdth-semi">{formatPhone(whatsapp)}</span>
          </div>
        </div>
        </div>
      </SignSheen>
    </div>
  );
}
