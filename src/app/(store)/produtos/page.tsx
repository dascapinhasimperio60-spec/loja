import type { Metadata } from "next";
import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog";
import { CatalogBrowser } from "@/components/store/catalog-browser";

export const metadata: Metadata = {
  title: "Vitrine",
  description: "Todas as capinhas e acessórios da Império das Capinhas. Filtre pelo modelo do seu celular e compre pelo Mercado Livre.",
  alternates: { canonical: "/produtos" },
};

export default async function ProductsPage() {
  const { products, categories } = await getCatalog();

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-10 sm:px-6 sm:pt-14 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-white/[0.06] pb-10 md:flex-row md:items-end md:justify-between">
        <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-black uppercase leading-[0.84] tracking-[-0.035em] wdth-expanded">
          A vitrine
        </h1>
        <p className="max-w-[40ch] text-lg leading-relaxed text-muted">
          Escolha o modelo do seu celular e veja tudo o que serve nele. A compra é finalizada no Mercado Livre.
        </p>
      </header>
      <div className="mt-10">
        <Suspense fallback={<div className="h-[60vh]" />}>
          <CatalogBrowser products={products} categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
