import { discountPercent, splitPrice } from "@/lib/format";

type Props = {
  price: number;
  compareAt?: number | null;
  size?: "sm" | "md" | "lg";
  tilt?: number;
  className?: string;
};

const sizes = {
  sm: { box: "px-2.5 py-1.5 gap-1.5", cur: "text-[0.62rem]", int: "text-xl", cents: "text-[0.7rem]", off: "text-[0.68rem] px-1.5 max-sm:hidden" },
  md: { box: "px-3 py-2 gap-2", cur: "text-xs", int: "text-3xl", cents: "text-sm", off: "text-sm px-2" },
  lg: { box: "px-4 py-3 gap-2.5", cur: "text-sm", int: "text-5xl sm:text-6xl", cents: "text-lg sm:text-xl", off: "text-lg sm:text-xl px-3" },
};

/** The yellow acrylic price tag hung on the hook. */
export function PricePlaque({ price, compareAt = null, size = "md", tilt = -2, className = "" }: Props) {
  const { int, cents } = splitPrice(price);
  const off = discountPercent(price, compareAt);
  const s = sizes[size];

  return (
    <span
      className={`plaque plaque-hole ${s.box} ${className}`}
      style={{ rotate: `${tilt}deg` }}
      aria-label={`Preço: R$ ${int},${cents}${off ? `, antes R$ ${splitPrice(compareAt!).int},${splitPrice(compareAt!).cents}` : ""}`}
    >
      <span className="flex flex-col leading-none" aria-hidden>
        {off > 0 && (
          <span className={`${s.cur} tabular mb-0.5 font-semibold text-black/60 line-through decoration-black/50`}>
            R$ {splitPrice(compareAt!).int},{splitPrice(compareAt!).cents}
          </span>
        )}
        <span className="flex items-start font-black tabular wdth-semi">
          <span className={`${s.cur} mt-[0.3em] mr-0.5 font-bold`}>R$</span>
          <span className={`${s.int} tracking-[-0.03em]`}>{int}</span>
          <span className={`${s.cents} mt-[0.18em] font-extrabold`}>,{cents}</span>
        </span>
      </span>
      {off > 0 && (
        <span
          className={`ml-0.5 flex items-center self-stretch rounded-[0.35rem] bg-ink font-black leading-none tracking-tight text-sign wdth-semi ${s.off}`}
          aria-hidden
        >
          -{off}%
        </span>
      )}
    </span>
  );
}
