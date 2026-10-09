"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, SpinnerGap, Trash, FloppyDisk } from "@phosphor-icons/react";
import { ImageUploader, type FormImage } from "./image-uploader";
import { ModelsInput } from "./models-input";
import { useToast } from "./toast";
import { ProductHang } from "@/components/store/product-hang";
import { deleteProduct, discardUploads, saveProduct } from "@/app/admin/actions";
import type { Category, Product } from "@/lib/types";

type Props = {
  product: Product | null;
  categories: Category[];
  knownModels: string[];
  storeUrl: string;
};

const field = "h-12 w-full rounded-xl bg-panel-2 px-4 text-led ring-1 ring-white/[0.1] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sign";

function parseMoney(v: string) {
  const clean = v.replace(/[^\d,.]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  const n = Number(clean);
  return Number.isFinite(n) ? n : NaN;
}

function moneyText(n: number | null | undefined) {
  return n === null || n === undefined ? "" : n.toFixed(2).replace(".", ",");
}

function Label({ htmlFor, children, hint }: { htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-bold">
        {children}
      </label>
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl bg-panel-2 p-4 ring-1 ring-white/[0.06]">
      <span>
        <span className="block font-bold">{label}</span>
        <span className="block text-sm text-muted">{description}</span>
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-7 w-12 rounded-full bg-white/15 transition-colors peer-checked:bg-sign peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sign" />
        <span className="absolute left-1 top-1 size-5 rounded-full bg-led shadow transition-transform peer-checked:translate-x-5 peer-checked:bg-ink" />
      </span>
    </label>
  );
}

export function ProductForm({ product, categories, knownModels, storeUrl }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [saving, startSaving] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const isNew = !product;
  const [id] = useState(() => product?.id ?? crypto.randomUUID());
  const fresh = useRef<string[]>([]);

  const [title, setTitle] = useState(product?.title ?? "");
  const [price, setPrice] = useState(moneyText(product?.price));
  const [compareAt, setCompareAt] = useState(moneyText(product?.compare_at_price));
  const [mlUrl, setMlUrl] = useState(product?.ml_url ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? "");
  const [models, setModels] = useState<string[]>(product?.models ?? []);
  const [material, setMaterial] = useState(product?.material ?? "");
  const [includes, setIncludes] = useState(product?.includes ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [soldOut, setSoldOut] = useState(product?.sold_out ?? false);
  const [images, setImages] = useState<FormImage[]>(
    (product?.images ?? []).map((img) => ({ ...img, key: img.id, status: "ready" as const, progress: 1 })),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const uploading = images.some((i) => i.status === "uploading");
  const priceNum = parseMoney(price);
  const compareNum = compareAt.trim() ? parseMoney(compareAt) : null;

  const preview: Product = useMemo(
    () => ({
      id,
      code: product?.code ?? 0,
      slug: product?.slug ?? "",
      title: title || "Nome do produto",
      description,
      price: Number.isFinite(priceNum) ? priceNum : 0,
      compare_at_price: compareNum !== null && Number.isFinite(compareNum) ? compareNum : null,
      ml_url: mlUrl,
      category_id: categoryId || null,
      models,
      material,
      includes,
      featured,
      active,
      sold_out: soldOut,
      position: 0,
      click_count: 0,
      created_at: "",
      updated_at: "",
      images: images
        .filter((i) => i.status === "ready" || i.preview)
        .map((i, position) => ({ id: i.key, url: i.preview || i.url, thumb_url: i.preview || i.thumb_url, storage_key: "", thumb_key: "", width: i.width, height: i.height, position })),
    }),
    [id, product, title, description, priceNum, compareNum, mlUrl, categoryId, models, material, includes, featured, active, soldOut, images],
  );

  function validate() {
    const e: Record<string, string> = {};
    if (title.trim().length < 2) e.title = "Dê um nome ao produto.";
    if (!Number.isFinite(priceNum) || !price.trim()) e.price = "Informe o preço (ex.: 49,90).";
    if (compareNum !== null && (!Number.isFinite(compareNum) || compareNum <= priceNum)) e.compareAt = "O preço \"de\" precisa ser maior que o preço atual.";
    if (mlUrl && !/^https:\/\/([a-z0-9-]+\.)*(mercadolivre\.com\.br|mercadolibre\.com|meli\.la|mercadolivre\.com)(\/|$)/i.test(mlUrl.trim()))
      e.mlUrl = "Use o link do anúncio no Mercado Livre (começa com https://).";
    if (active && !mlUrl.trim()) e.mlUrl = "Para publicar, cole o link do anúncio no Mercado Livre.";
    if (active && !images.some((i) => i.status === "ready")) e.images = "Para publicar, adicione pelo menos uma foto.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (uploading) return toast("error", "Espere as fotos terminarem de subir.");
    if (!validate()) return toast("error", "Confira os campos destacados.");

    startSaving(async () => {
      const res = await saveProduct({
        id,
        isNew,
        title,
        description,
        price: priceNum,
        compare_at_price: compareNum,
        ml_url: mlUrl.trim(),
        category_id: categoryId || null,
        models,
        material,
        includes,
        featured,
        active,
        sold_out: soldOut,
        images: images
          .filter((i) => i.status === "ready")
          .map(({ id: imgId, url, thumb_url, storage_key, thumb_key, width, height }) => ({ ...(imgId ? { id: imgId } : {}), url, thumb_url, storage_key, thumb_key, width, height })),
      });
      if (!res.ok) {
        toast("error", res.error);
        return;
      }
      fresh.current = [];
      toast("ok", isNew ? "Produto cadastrado. Já está na loja." : "Alterações salvas.");
      if (isNew) router.replace(`/admin/produtos/${id}`);
      router.refresh();
    });
  }

  async function onCancel() {
    if (fresh.current.length) await discardUploads(fresh.current);
    router.push("/admin/produtos");
  }

  async function onDelete() {
    if (!product) return;
    if (!window.confirm(`Excluir "${product.title}"? As fotos também serão apagadas. Isso não pode ser desfeito.`)) return;
    setDeleting(true);
    const res = await deleteProduct(product.id);
    if (!res.ok) {
      setDeleting(false);
      toast("error", res.error);
      return;
    }
    toast("ok", "Produto excluído.");
    router.replace("/admin/produtos");
    router.refresh();
  }

  const err = (k: string) => errors[k] && <p className="mt-1.5 text-sm text-danger">{errors[k]}</p>;

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="flex size-10 items-center justify-center rounded-full bg-panel-2 ring-1 ring-white/[0.08] hover:bg-panel-3" aria-label="Voltar para produtos">
            <ArrowLeft size={18} aria-hidden />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-[-0.02em] wdth-expanded sm:text-3xl">{isNew ? "Novo produto" : "Editar produto"}</h1>
            {product && <p className="text-sm text-muted tabular">Cód. {product.code} · {product.click_count} cliques em comprar</p>}
          </div>
        </div>
        {product && product.active && (
          <a href={`${storeUrl}/produto/${product.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-sign ring-1 ring-sign/40 hover:bg-sign/10">
            Ver na loja <ArrowSquareOut size={16} aria-hidden />
          </a>
        )}
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-8">
          <section aria-labelledby="fotos">
            <h2 id="fotos" className="mb-3 text-lg font-black uppercase wdth-semi">Fotos</h2>
            <ImageUploader folder={id} images={images} onChange={setImages} onUploaded={(keys) => fresh.current.push(...keys)} />
            {err("images")}
          </section>

          <section aria-labelledby="dados" className="space-y-5">
            <h2 id="dados" className="text-lg font-black uppercase wdth-semi">Dados do produto</h2>
            <div>
              <Label htmlFor="title" hint={`${title.length}/140`}>Nome</Label>
              <input id="title" className={field} value={title} maxLength={140} onChange={(e) => setTitle(e.target.value)} placeholder="Capinha Silicone Aveludada MagSafe Lavanda" />
              {err("title")}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <input id="price" inputMode="decimal" className={`${field} tabular`} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="49,90" />
                {err("price")}
              </div>
              <div>
                <Label htmlFor="compare" hint="opcional">Preço &quot;de&quot; (riscado)</Label>
                <input id="compare" inputMode="decimal" className={`${field} tabular`} value={compareAt} onChange={(e) => setCompareAt(e.target.value)} placeholder="69,90" />
                {err("compareAt")}
              </div>
            </div>

            <div>
              <Label htmlFor="ml" hint="obrigatório para publicar">Link do anúncio no Mercado Livre</Label>
              <div className="flex gap-2">
                <input
                  id="ml"
                  type="url"
                  inputMode="url"
                  className={field}
                  value={mlUrl}
                  onChange={(e) => setMlUrl(e.target.value)}
                  placeholder="https://produto.mercadolivre.com.br/MLB-..."
                />
                {mlUrl.startsWith("https://") && (
                  <a href={mlUrl} target="_blank" rel="noopener noreferrer" className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl bg-panel-3 px-3 text-sm font-bold hover:bg-white/[0.12]">
                    Testar <ArrowSquareOut size={14} aria-hidden />
                  </a>
                )}
              </div>
              {err("mlUrl")}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select id="category" className={field} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="material" hint="opcional">Material</Label>
                <input id="material" className={field} value={material} maxLength={120} onChange={(e) => setMaterial(e.target.value)} placeholder="Silicone aveludado" />
              </div>
            </div>

            <div>
              <Label hint="aparece em &quot;Qual é o seu celular?&quot;">Modelos compatíveis</Label>
              <ModelsInput value={models} onChange={setModels} known={knownModels} />
            </div>

            <div>
              <Label htmlFor="includes" hint="opcional">O que vem</Label>
              <input id="includes" className={field} value={includes} maxLength={240} onChange={(e) => setIncludes(e.target.value)} placeholder="1 capinha + 1 película" />
            </div>

            <div>
              <Label htmlFor="description" hint={`${description.length}/4000`}>Descrição</Label>
              <textarea
                id="description"
                rows={6}
                maxLength={4000}
                className="w-full rounded-xl bg-panel-2 px-4 py-3 text-led ring-1 ring-white/[0.1] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sign"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Toque macio, proteção da câmera, interior em microfibra..."
              />
            </div>
          </section>

          <section aria-labelledby="vitrine" className="space-y-3">
            <h2 id="vitrine" className="text-lg font-black uppercase wdth-semi">Na vitrine</h2>
            <Toggle checked={active} onChange={setActive} label="Publicado" description="Aparece na loja. Desligue para guardar como rascunho." />
            <Toggle checked={featured} onChange={setFeatured} label="Destaque" description="Vai para o trilho de ganchos no topo da página inicial." />
            <Toggle checked={soldOut} onChange={setSoldOut} label="Esgotado" description="Continua visível, mas o botão vira &quot;Avise-me pelo WhatsApp&quot;." />
          </section>

          {product && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-danger ring-1 ring-danger/30 hover:bg-danger/10 disabled:opacity-50"
            >
              {deleting ? <SpinnerGap size={18} className="animate-spin" aria-hidden /> : <Trash size={18} aria-hidden />}
              Excluir produto
            </button>
          )}
        </div>

        <aside className="hidden xl:block" aria-label="Prévia na loja">
          <div className="sticky top-10">
            <p className="mb-3 text-sm font-bold text-muted">Prévia na vitrine</p>
            <div className="slatwall rounded-[1.25rem] px-6 pb-8 pt-4 ring-1 ring-white/[0.05]">
              <div className="pointer-events-none">
                <ProductHang product={preview} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-16 z-20 -mx-4 mt-10 border-t border-white/[0.08] bg-ink/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:bottom-0 lg:-mx-10 lg:px-10">
        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/produtos" onClick={(e) => (e.preventDefault(), void onCancel())} className="rounded-full px-5 py-3 text-sm font-bold text-led/80 hover:text-led">
            Cancelar
          </Link>
          <button type="submit" disabled={saving || uploading} className="plaque px-6 py-3 text-base font-black uppercase wdth-semi disabled:opacity-60">
            {saving ? <SpinnerGap size={20} className="animate-spin" aria-hidden /> : <FloppyDisk size={20} weight="fill" aria-hidden />}
            {uploading ? "Enviando fotos..." : isNew ? "Cadastrar" : "Salvar"}
          </button>
        </div>
      </div>
    </form>
  );
}
