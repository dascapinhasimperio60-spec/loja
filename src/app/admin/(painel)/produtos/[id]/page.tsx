import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminCategories, getAdminProduct, getAdminProducts } from "@/lib/admin/queries";
import { env } from "@/lib/env";

export const metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [product, categories, products] = await Promise.all([getAdminProduct(id), getAdminCategories(), getAdminProducts()]);
  if (!product) notFound();
  const knownModels = Array.from(new Set(products.flatMap((p) => p.models)));
  return <ProductForm key={product.updated_at} product={product} categories={categories} knownModels={knownModels} storeUrl={env.siteUrl} />;
}
