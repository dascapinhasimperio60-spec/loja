import { ProductList } from "@/components/admin/product-list";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/queries";

export const metadata = { title: "Produtos" };

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
  return <ProductList products={products} categories={categories} />;
}
