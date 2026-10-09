import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/queries";
import { env } from "@/lib/env";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const [categories, products] = await Promise.all([getAdminCategories(), getAdminProducts()]);
  const knownModels = Array.from(new Set(products.flatMap((p) => p.models)));
  return <ProductForm product={null} categories={categories} knownModels={knownModels} storeUrl={env.siteUrl} />;
}
