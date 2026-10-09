import { ProductHang } from "./product-hang";
import type { Product } from "@/lib/types";

/** A metal bar with the featured products hanging from it. */
export function HookRail({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <div className="relative">
      <div className="-mx-4 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-6 sm:snap-none [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="relative w-max min-w-full sm:w-auto">
          <div className="rail absolute inset-x-0 top-0" aria-hidden />
          <ul className="grid auto-cols-[min(68vw,15.5rem)] grid-flow-col gap-4 pt-1 sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
            {products.map((p, i) => (
              <li key={p.id} className={`snap-start ${i >= 3 ? "sm:hidden xl:block" : ""}`}>
                <ProductHang product={p} index={i} priority={i < 2} mount="rail" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
