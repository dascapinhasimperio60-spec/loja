import Image from "next/image";

/** Crown + phone mark with the stacked storefront lettering. */
export function Wordmark({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Image src="/brand/mark.webp" alt="" width={217} height={354} className={compact ? "h-9 w-auto" : "h-11 w-auto"} priority />
      <span className="flex flex-col leading-[0.82]">
        <span className={`font-black uppercase tracking-[-0.02em] wdth-expanded ${compact ? "text-[1.05rem]" : "text-[1.25rem]"}`}>Império</span>
        <span className={`font-extrabold italic uppercase tracking-[-0.01em] text-sign wdth-semi ${compact ? "text-[0.72rem]" : "text-[0.82rem]"}`}>
          das capinhas
        </span>
      </span>
    </span>
  );
}
