import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { getCatalog, getProductBySlug } from "@/lib/catalog";
import { env } from "@/lib/env";
import { modelSlug } from "@/lib/models";
import { ProductGallery } from "@/components/store/product-gallery";
import { BuyActions } from "@/components/store/buy-actions";
import { PricePlaque } from "@/components/store/price-plaque";
import { HookRail } from "@/components/store/hook-rail";
import { LedStrip } from "@/components/store/led-shelf";
import { TrackVisit } from "@/components/store/track-visit";

export const dynamicParams = true;

export async function generateStaticParams() {
  const { products } = await getCatalog();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  const description = (product.description || product.title).replace(/\s+/g, " ").slice(0, 155);
  const image = product.images[0];
  return {
    title: product.title,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      title: product.title,
      description,
      images: image ? [{ url: image.url, width: image.width || undefined, height: image.height || undefined }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { catalog, product } = await getProductBySlug(slug);
  if (!product) notFound();

  const { settings, categories, products } = catalog;
  const category = categories.find((c) => c.id === product.category_id);
  const pageUrl = `${env.siteUrl}/produto/${product.slug}`;

  const related = products
    .filter((p) => p.id !== product.id && !p.sold_out)
    .map((p) => ({ p, score: p.models.filter((m) => product.models.includes(m)).length * 2 + (p.category_id === product.category_id ? 1 : 0) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((r) => r.p);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    sku: String(product.code),
    image: product.images.map((i) => (i.url.startsWith("http") ? i.url : `${env.siteUrl}${i.url}`)),
    description: product.description,
    brand: { "@type": "Brand", name: settings.store_name },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      availability: product.sold_out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: pageUrl,
    },
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6 sm:pt-10 lg:px-10">
      <TrackVisit page="produto" productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Caminho" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/produtos" className="hover:text-led">
              Vitrine
            </Link>
          </li>
          {category && (
            <>
              <CaretRight size={12} aria-hidden />
              <li>
                <Link href={`/produtos?categoria=${category.slug}`} className="hover:text-led">
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <CaretRight size={12} aria-hidden />
          <li aria-current="page" className="max-w-[40ch] truncate text-led/80">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="min-w-0 lg:col-span-7">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        <div className="min-w-0 lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-muted">
              <span className="tabular rounded-md bg-white/[0.07] px-2 py-1 font-bold text-led">Cód. {product.code}</span>
              {category && <span>{category.name}</span>}
              {product.sold_out && <span className="rounded-md border border-led/40 px-2 py-0.5 font-bold uppercase text-led">Esgotado</span>}
            </p>
            <h1 className="mt-4 text-[clamp(1.9rem,3.6vw,3.1rem)] font-black leading-[1] tracking-[-0.025em] wdth-semi">{product.title}</h1>

            <div className="mt-7">
              <PricePlaque price={product.price} compareAt={product.compare_at_price} size="lg" tilt={-1.5} />
            </div>

            {product.models.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-black uppercase tracking-[0.06em] wdth-semi">Compatível com</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.models.map((m) => (
                    <li key={m}>
                      <Link
                        href={`/produtos?modelo=${modelSlug(m)}`}
                        className="tag tag-hole tag-shape flex items-center gap-2 py-1.5 pr-3 text-sm font-semibold transition-colors hover:text-sign"
                      >
                        {m}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8">
              <BuyActions product={product} whatsapp={settings.whatsapp} pageUrl={pageUrl} />
            </div>

            {(product.material || product.includes || product.description) && (
              <div className="mt-10 border-t border-white/[0.07] pt-8">
                {(product.material || product.includes) && (
                  <dl className="mb-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[0.95rem]">
                    {product.material && (
                      <>
                        <dt className="font-bold text-muted">Material</dt>
                        <dd>{product.material}</dd>
                      </>
                    )}
                    {product.includes && (
                      <>
                        <dt className="font-bold text-muted">O que vem</dt>
                        <dd>{product.includes}</dd>
                      </>
                    )}
                  </dl>
                )}
                {product.description && (
                  <div className="max-w-[65ch] whitespace-pre-line text-[1.02rem] leading-relaxed text-led/85">{product.description}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-28 sm:mt-36" aria-labelledby="relacionados">
          <h2 id="relacionados" className="text-[clamp(2rem,4.6vw,3.8rem)] font-black uppercase leading-[0.9] tracking-[-0.03em] wdth-expanded">
            Mais no mesmo gancho
          </h2>
          <div className="mt-10">
            <LedStrip className="mb-7 px-[4%]" />
            <HookRail products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
