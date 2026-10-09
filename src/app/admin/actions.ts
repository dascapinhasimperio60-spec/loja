"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin/auth";
import { CATALOG_TAG } from "@/lib/catalog";
import { slugify } from "@/lib/format";
import { createUploadAuth, deleteFiles, hasImageKit, isFileId, type UploadAuth } from "@/lib/imagekit";

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/** Store pages are static; this refreshes them right after a save. */
function refreshStore() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}

function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof z.ZodError) {
    return { ok: false, error: error.issues[0]?.message ?? "Dados inválidos." };
  }
  if (error instanceof Error) return { ok: false, error: error.message };
  if (error && typeof error === "object" && "message" in error) return { ok: false, error: String(error.message) };
  return { ok: false, error: "Algo deu errado. Tente de novo." };
}

// ---------------------------------------------------------------------------
// Uploads (signed, straight from the browser to ImageKit)
// ---------------------------------------------------------------------------
const uploadRequest = z.object({
  folder: z.string().uuid(),
  count: z.number().int().min(1).max(12),
});

export type UploadTicket = UploadAuth & { folder: string };

export async function createUploadTickets(input: z.input<typeof uploadRequest>): Promise<Result<UploadTicket[]>> {
  try {
    await assertAdmin();
    if (!hasImageKit) throw new Error("O ImageKit não está configurado (veja o README).");
    const { folder, count } = uploadRequest.parse(input);
    const tickets = Array.from({ length: count }, () => ({ ...createUploadAuth(), folder: `/imperio/produtos/${folder}` }));
    return { ok: true, data: tickets };
  } catch (error) {
    return fail(error);
  }
}

/** Removes uploads the shopkeeper discarded before saving. */
export async function discardUploads(fileIds: string[]): Promise<Result> {
  try {
    await assertAdmin();
    if (hasImageKit) await deleteFiles(fileIds.filter(isFileId));
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
const imageSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url(),
  thumb_url: z.string().url(),
  storage_key: z.string().min(1),
  thumb_key: z.string().min(1),
  width: z.number().int().nonnegative(),
  height: z.number().int().nonnegative(),
});

const money = z.coerce.number().min(0, "Preço não pode ser negativo.").max(999999, "Preço alto demais.");

const productSchema = z
  .object({
    id: z.string().uuid(),
    isNew: z.boolean(),
    title: z.string().trim().min(2, "Dê um nome ao produto.").max(140, "Nome muito longo (máx. 140)."),
    slug: z.string().trim().max(80).optional(),
    description: z.string().trim().max(4000, "Descrição muito longa (máx. 4000).").default(""),
    price: money,
    compare_at_price: money.nullable(),
    ml_url: z
      .string()
      .trim()
      .refine(
        (v) => v === "" || /^https:\/\/([a-z0-9-]+\.)*(mercadolivre\.com\.br|mercadolibre\.com|meli\.la|mercadolivre\.com)(\/|$)/i.test(v),
        "Use um link do Mercado Livre (mercadolivre.com.br ou meli.la).",
      ),
    category_id: z.string().uuid().nullable(),
    models: z.array(z.string().trim().min(1).max(60)).max(40),
    material: z.string().trim().max(120).default(""),
    includes: z.string().trim().max(240).default(""),
    featured: z.boolean(),
    active: z.boolean(),
    sold_out: z.boolean(),
    images: z.array(imageSchema).max(12, "Máximo de 12 fotos por produto."),
  })
  .refine((p) => p.compare_at_price === null || p.compare_at_price > p.price, {
    message: "O preço \"de\" precisa ser maior que o preço atual.",
    path: ["compare_at_price"],
  })
  .refine((p) => !p.active || p.ml_url !== "", {
    message: "Para publicar, cole o link do anúncio no Mercado Livre.",
    path: ["ml_url"],
  })
  .refine((p) => !p.active || p.images.length > 0, {
    message: "Para publicar, adicione pelo menos uma foto.",
    path: ["images"],
  });

export type ProductInput = z.input<typeof productSchema>;

async function uniqueSlug(supabase: Awaited<ReturnType<typeof assertAdmin>>["supabase"], base: string, id: string) {
  const root = slugify(base) || "produto";
  let candidate = root;
  for (let i = 2; i < 50; i++) {
    const { data } = await supabase.from("products").select("id").eq("slug", candidate).neq("id", id).maybeSingle();
    if (!data) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${id.slice(0, 6)}`;
}

export async function saveProduct(input: ProductInput): Promise<Result<{ id: string; slug: string }>> {
  try {
    const { supabase } = await assertAdmin();
    const p = productSchema.parse(input);
    const slug = await uniqueSlug(supabase, p.slug || p.title, p.id);

    const row = {
      id: p.id,
      slug,
      title: p.title,
      description: p.description,
      price: p.price,
      compare_at_price: p.compare_at_price,
      ml_url: p.ml_url,
      category_id: p.category_id,
      models: Array.from(new Set(p.models)),
      material: p.material,
      includes: p.includes,
      featured: p.featured,
      active: p.active,
      sold_out: p.sold_out,
    };

    if (p.isNew) {
      const { data: last } = await supabase.from("products").select("position").order("position", { ascending: true }).limit(1).maybeSingle();
      const { error } = await supabase.from("products").insert({ ...row, position: (last?.position ?? 1) - 1 });
      if (error) throw error;
    } else {
      const { error } = await supabase.from("products").update(row).eq("id", p.id);
      if (error) throw error;
    }

    // Sync photos: keep order, drop removed ones (and their ImageKit files).
    const { data: existing, error: imgErr } = await supabase
      .from("product_images")
      .select("id, storage_key, thumb_key")
      .eq("product_id", p.id);
    if (imgErr) throw imgErr;

    const keepIds = new Set(p.images.map((img) => img.id).filter(Boolean));
    const removed = (existing ?? []).filter((img) => !keepIds.has(img.id));
    if (removed.length) {
      const { error } = await supabase.from("product_images").delete().in("id", removed.map((r) => r.id));
      if (error) throw error;
      if (hasImageKit) await deleteFiles(removed.flatMap((r) => [r.storage_key, r.thumb_key]));
    }

    const rows = p.images.map((img, position) => ({
      ...(img.id ? { id: img.id } : {}),
      product_id: p.id,
      url: img.url,
      thumb_url: img.thumb_url,
      storage_key: img.storage_key,
      thumb_key: img.thumb_key,
      width: img.width,
      height: img.height,
      position,
    }));
    const updates = rows.filter((r) => "id" in r);
    const inserts = rows.filter((r) => !("id" in r));
    if (updates.length) {
      const { error } = await supabase.from("product_images").upsert(updates);
      if (error) throw error;
    }
    if (inserts.length) {
      const { error } = await supabase.from("product_images").insert(inserts);
      if (error) throw error;
    }

    refreshStore();
    return { ok: true, data: { id: p.id, slug } };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteProduct(id: string): Promise<Result> {
  try {
    const { supabase } = await assertAdmin();
    z.string().uuid().parse(id);
    const { data: imgs } = await supabase.from("product_images").select("storage_key, thumb_key").eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    if (hasImageKit && imgs?.length) await deleteFiles(imgs.flatMap((i) => [i.storage_key, i.thumb_key]));
    refreshStore();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

const flagSchema = z.object({
  id: z.string().uuid(),
  field: z.enum(["active", "featured", "sold_out"]),
  value: z.boolean(),
});

export async function setProductFlag(input: z.input<typeof flagSchema>): Promise<Result> {
  try {
    const { supabase } = await assertAdmin();
    const { id, field, value } = flagSchema.parse(input);
    if (field === "active" && value) {
      const { data } = await supabase.from("products").select("ml_url, product_images(id)").eq("id", id).single();
      if (!data?.ml_url) throw new Error("Cole o link do Mercado Livre antes de publicar.");
      if (!data.product_images?.length) throw new Error("Adicione uma foto antes de publicar.");
    }
    const { error } = await supabase.from("products").update({ [field]: value }).eq("id", id);
    if (error) throw error;
    refreshStore();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function reorderProducts(ids: string[]): Promise<Result> {
  try {
    const { supabase } = await assertAdmin();
    const list = z.array(z.string().uuid()).max(2000).parse(ids);
    await Promise.all(
      list.map((id, position) => supabase.from("products").update({ position }).eq("id", id).then(({ error }) => {
        if (error) throw error;
      })),
    );
    refreshStore();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Nome muito curto.").max(40, "Nome muito longo."),
});

export async function saveCategory(input: z.input<typeof categorySchema>): Promise<Result> {
  try {
    const { supabase } = await assertAdmin();
    const c = categorySchema.parse(input);
    const slug = slugify(c.name);
    if (c.id) {
      const { error } = await supabase.from("categories").update({ name: c.name, slug }).eq("id", c.id);
      if (error) throw error;
    } else {
      const { data: last } = await supabase.from("categories").select("position").order("position", { ascending: false }).limit(1).maybeSingle();
      const { error } = await supabase.from("categories").insert({ name: c.name, slug, position: (last?.position ?? 0) + 1 });
      if (error) throw error;
    }
    refreshStore();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteCategory(id: string): Promise<Result> {
  try {
    const { supabase } = await assertAdmin();
    const { error } = await supabase.from("categories").delete().eq("id", z.string().uuid().parse(id));
    if (error) throw error;
    refreshStore();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

// ---------------------------------------------------------------------------
// Store settings
// ---------------------------------------------------------------------------
const settingsSchema = z.object({
  store_name: z.string().trim().min(2).max(60),
  tagline: z.string().trim().max(80),
  whatsapp: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .transform((v) => (v.length === 10 || v.length === 11 ? `55${v}` : v))
    .refine((v) => /^55\d{10,11}$/.test(v), "WhatsApp inválido. Use DDD + número, ex.: 61 99312-5211."),
  instagram: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, ""))
    .refine((v) => /^[a-zA-Z0-9._]{1,30}$/.test(v), "Usuário do Instagram inválido."),
  address: z.string().trim().max(200),
  maps_url: z.string().trim().max(500).refine((v) => v === "" || /^https:\/\//.test(v), "O link do mapa precisa começar com https://"),
  opening_hours: z.string().trim().max(120),
  announcement: z.string().trim().max(90),
});

export type SettingsInput = z.input<typeof settingsSchema>;

export async function saveSettings(input: SettingsInput): Promise<Result> {
  try {
    const { supabase } = await assertAdmin();
    const s = settingsSchema.parse(input);
    const { error } = await supabase.from("settings").update(s).eq("id", 1);
    if (error) throw error;
    refreshStore();
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
