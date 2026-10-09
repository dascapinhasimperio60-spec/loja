import { CategoryManager } from "@/components/admin/category-manager";
import { getAdminCategories, getAdminProducts } from "@/lib/admin/queries";

export const metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const [categories, products] = await Promise.all([getAdminCategories(), getAdminProducts()]);
  const counts: Record<string, number> = {};
  products.forEach((p) => {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  });
  return <CategoryManager categories={categories} counts={counts} />;
}
