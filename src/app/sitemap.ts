import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, demo } = await getCatalog();
  const base = env.siteUrl;
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produtos`, changeFrequency: "daily", priority: 0.9 },
    ...(demo
      ? []
      : products.map((p) => ({ url: `${base}/produto/${p.slug}`, lastModified: p.updated_at, changeFrequency: "weekly" as const, priority: 0.7 }))),
  ];
}
