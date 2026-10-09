import "server-only";
import { unstable_cache } from "next/cache";
import { hasSupabase } from "@/lib/env";
import { getPublicSupabase } from "@/lib/supabase/server";
import { demoCatalog } from "@/lib/demo-data";
import type { Catalog, Category, Product, Settings } from "@/lib/types";

export const CATALOG_TAG = "catalog";

export const DEFAULT_SETTINGS: Settings = {
  store_name: "Império das Capinhas",
  tagline: "Capinhas, acessórios & assistência técnica",
  whatsapp: "5561993125211",
  instagram: "imperiodascapinhas25",
  address: "",
  maps_url: "",
  opening_hours: "",
  announcement: "Enviamos para todo o Brasil",
};

const PRODUCT_COLUMNS =
  // Public columns only: click counts and storage keys stay private (see 0002 migration).
  "id, code, slug, title, description, price, compare_at_price, ml_url, category_id, models, material, includes, featured, active, sold_out, position, created_at, updated_at, images:product_images(id, url, thumb_url, width, height, position)";

async function fetchCatalog(): Promise<Catalog> {
  const supabase = getPublicSupabase();
  const [products, categories, settings] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("active", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name, slug, position").order("position"),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  if (products.error) throw products.error;

  const list = (products.data ?? []).map((p) => ({
    ...p,
    price: Number(p.price),
    compare_at_price: p.compare_at_price === null ? null : Number(p.compare_at_price),
    click_count: 0,
    images: [...(p.images ?? [])]
      .map((img) => ({ ...img, storage_key: "", thumb_key: "" }))
      .sort((a, b) => a.position - b.position),
  })) as Product[];

  return {
    products: list,
    categories: (categories.data ?? []) as Category[],
    settings: { ...DEFAULT_SETTINGS, ...(settings.data ?? {}) },
    demo: false,
  };
}

/**
 * The whole public catalog in one cached read.
 * Invalidated on demand (revalidateTag) whenever the admin saves something,
 * with a daily safety refresh. Visitors never hit Supabase directly.
 */
const cachedCatalog = unstable_cache(fetchCatalog, ["catalog-v1"], {
  tags: [CATALOG_TAG],
  revalidate: 86400,
});

export async function getCatalog(): Promise<Catalog> {
  if (!hasSupabase) return demoCatalog;
  try {
    const catalog = await cachedCatalog();
    // Empty store: show the demo shelf so the site never looks abandoned.
    if (catalog.products.length === 0) return { ...demoCatalog, settings: catalog.settings, categories: catalog.categories.length ? catalog.categories : demoCatalog.categories };
    return catalog;
  } catch (error) {
    console.error("[catalog] falling back to demo data", error);
    return demoCatalog;
  }
}

export async function getProductBySlug(slug: string) {
  const catalog = await getCatalog();
  const product = catalog.products.find((p) => p.slug === slug) ?? null;
  return { catalog, product };
}
