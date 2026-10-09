import "server-only";
import { requireAdmin } from "@/lib/admin/auth";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import type { Category, Product, Settings } from "@/lib/types";

const PRODUCT_COLUMNS =
  "id, code, slug, title, description, price, compare_at_price, ml_url, category_id, models, material, includes, featured, active, sold_out, position, click_count, created_at, updated_at, images:product_images(id, url, thumb_url, storage_key, thumb_key, width, height, position)";

function normalizeProduct(p: Record<string, unknown>): Product {
  const images = ((p.images as Product["images"]) ?? []).slice().sort((a, b) => a.position - b.position);
  return {
    ...(p as unknown as Product),
    price: Number(p.price),
    compare_at_price: p.compare_at_price === null ? null : Number(p.compare_at_price),
    images,
  };
}

export async function getAdminProducts() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeProduct);
}

export async function getAdminProduct(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select(PRODUCT_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? normalizeProduct(data) : null;
}

export async function getAdminCategories(): Promise<Category[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("id, name, slug, position").order("position");
  return (data ?? []) as Category[];
}

export async function getAdminSettings(): Promise<Settings> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
}

const spDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);

export async function getClickStats(days = 30) {
  const { supabase } = await requireAdmin();
  const since = spDay(new Date(Date.now() - (days - 1) * 86400000));
  const { data } = await supabase.from("click_daily").select("product_id, day, kind, count").gte("day", since);
  const rows = data ?? [];
  const byProduct = new Map<string, { ml: number; whatsapp: number }>();
  const byDay = new Map<string, number>();
  let ml = 0;
  let whatsapp = 0;
  for (const r of rows) {
    const entry = byProduct.get(r.product_id) ?? { ml: 0, whatsapp: 0 };
    if (r.kind === "ml") {
      entry.ml += r.count;
      ml += r.count;
      byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.count);
    } else {
      entry.whatsapp += r.count;
      whatsapp += r.count;
    }
    byProduct.set(r.product_id, entry);
  }
  const series: { day: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = spDay(new Date(Date.now() - i * 86400000));
    series.push({ day, count: byDay.get(day) ?? 0 });
  }
  return { ml, whatsapp, byProduct, series };
}
