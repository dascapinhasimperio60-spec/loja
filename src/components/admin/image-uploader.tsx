"use client";

import { useRef, useState } from "react";
import { Reorder } from "motion/react";
import { ImageSquare, Trash, Star, SpinnerGap, UploadSimple, WarningCircle } from "@phosphor-icons/react";
import { compressImage } from "@/lib/compress-image";
import { createUploadTickets, type UploadTicket } from "@/app/admin/actions";
import { thumbUrl } from "@/lib/imagekit-url";

export type FormImage = {
  /** db id when the photo already exists */
  id?: string;
  /** local key for React and Reorder */
  key: string;
  url: string;
  thumb_url: string;
  storage_key: string;
  thumb_key: string;
  width: number;
  height: number;
  status: "ready" | "uploading" | "error";
  progress: number;
  preview?: string;
  error?: string;
};

type ImageKitFile = { fileId: string; url: string; width?: number; height?: number };

/** Signed multipart upload to ImageKit, with progress. */
function uploadWithProgress(ticket: UploadTicket, blob: Blob, onProgress: (p: number) => void) {
  return new Promise<ImageKitFile>((resolve, reject) => {
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const form = new FormData();
    form.append("file", blob, `foto.${ext}`);
    form.append("fileName", `foto.${ext}`);
    form.append("useUniqueFileName", "true");
    form.append("folder", ticket.folder);
    form.append("publicKey", ticket.publicKey);
    form.append("signature", ticket.signature);
    form.append("expire", String(ticket.expire));
    form.append("token", ticket.token);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      const body = xhr.response as (ImageKitFile & { message?: string }) | null;
      if (xhr.status >= 200 && xhr.status < 300 && body?.fileId && body.url) resolve(body);
      else reject(new Error(body?.message ? `ImageKit: ${body.message}` : `ImageKit respondeu ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Falha de rede ao enviar a foto. Verifique a conexão e tente de novo."));
    xhr.send(form);
  });
}

type Props = {
  folder: string;
  images: FormImage[];
  onChange: (updater: (prev: FormImage[]) => FormImage[]) => void;
  onUploaded: (keys: string[]) => void;
  max?: number;
};

export function ImageUploader({ folder, images, onChange, onUploaded, max = 12 }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function addFiles(fileList: FileList | File[]) {
    setNotice(null);
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    const room = max - images.length;
    if (room <= 0) {
      setNotice(`Máximo de ${max} fotos por produto.`);
      return;
    }
    const batch = files.slice(0, room);
    if (files.length > room) setNotice(`Só cabem mais ${room} foto(s); o resto foi ignorado.`);

    const drafts: FormImage[] = batch.map((file) => ({
      key: crypto.randomUUID(),
      url: "",
      thumb_url: "",
      storage_key: "",
      thumb_key: "",
      width: 0,
      height: 0,
      status: "uploading",
      progress: 0,
      preview: URL.createObjectURL(file),
    }));
    onChange((prev) => [...prev, ...drafts]);

    const patch = (key: string, data: Partial<FormImage>) => onChange((prev) => prev.map((img) => (img.key === key ? { ...img, ...data } : img)));

    // compress first (in the browser), then ask for upload tickets in one call
    const compressed = await Promise.all(
      batch.map((file, i) =>
        compressImage(file).catch((e: Error) => {
          patch(drafts[i].key, { status: "error", error: e.message });
          return null;
        }),
      ),
    );
    const ok = compressed.map((c, i) => ({ c, d: drafts[i] })).filter((x) => x.c);
    if (!ok.length) return;

    const res = await createUploadTickets({ folder, count: ok.length });
    if (!res.ok || !res.data) {
      ok.forEach(({ d }) => patch(d.key, { status: "error", error: res.ok ? "Falha no envio." : res.error }));
      return;
    }

    await Promise.all(
      ok.map(async ({ c, d }, i) => {
        try {
          const file = await uploadWithProgress(res.data![i], c!.blob, (p) => patch(d.key, { progress: p }));
          onUploaded([file.fileId]);
          patch(d.key, {
            status: "ready",
            progress: 1,
            url: file.url,
            thumb_url: thumbUrl(file.url),
            storage_key: file.fileId,
            thumb_key: file.fileId,
            width: file.width || c!.width,
            height: file.height || c!.height,
          });
        } catch (e) {
          patch(d.key, { status: "error", error: e instanceof Error ? e.message : "Falha no envio." });
        }
      }),
    );
  }

  function remove(key: string) {
    onChange((prev) => {
      const img = prev.find((i) => i.key === key);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.key !== key);
    });
  }

  function makeCover(key: string) {
    onChange((prev) => {
      const img = prev.find((i) => i.key === key);
      return img ? [img, ...prev.filter((i) => i.key !== key)] : prev;
    });
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-3 transition-colors ${dragging ? "border-sign bg-sign/5" : "border-white/[0.12]"}`}
      >
        {images.length > 0 && (
          <Reorder.Group axis="x" values={images} onReorder={(next) => onChange(() => next)} className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <Reorder.Item key={img.key} value={img} className="relative w-28 shrink-0 cursor-grab touch-pan-y active:cursor-grabbing sm:w-32">
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-panel-2 ring-1 ring-white/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview || img.thumb_url} alt="" className="size-full object-cover" draggable={false} />
                  {img.status === "uploading" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/65">
                      <SpinnerGap size={22} className="animate-spin text-sign" aria-hidden />
                      <div className="h-1 w-3/4 overflow-hidden rounded-full bg-white/15">
                        <div className="h-full bg-sign transition-[width]" style={{ width: `${Math.round(img.progress * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  {img.status === "error" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#2a1413]/90 p-2 text-center text-[0.68rem] font-semibold text-danger">
                      <WarningCircle size={20} weight="fill" aria-hidden />
                      {img.error}
                    </div>
                  )}
                  {i === 0 && img.status === "ready" && (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-sign px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-on-sign">Capa</span>
                  )}
                </div>
                <div className="mt-1.5 flex justify-between">
                  <button
                    type="button"
                    onClick={() => makeCover(img.key)}
                    disabled={i === 0}
                    className="flex size-8 items-center justify-center rounded-lg text-led/70 hover:bg-white/[0.06] hover:text-sign disabled:opacity-30"
                    aria-label="Usar como capa"
                    title="Usar como capa"
                  >
                    <Star size={16} weight={i === 0 ? "fill" : "regular"} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(img.key)}
                    className="flex size-8 items-center justify-center rounded-lg text-led/70 hover:bg-danger/10 hover:text-danger"
                    aria-label="Remover foto"
                    title="Remover foto"
                  >
                    <Trash size={16} aria-hidden />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}

        <button
          type="button"
          onClick={() => input.current?.click()}
          className={`flex w-full items-center justify-center gap-3 rounded-xl px-4 text-left transition-colors hover:bg-white/[0.03] ${images.length ? "py-4" : "py-10"}`}
        >
          {images.length ? <UploadSimple size={22} className="text-sign" aria-hidden /> : <ImageSquare size={36} className="text-sign" aria-hidden />}
          <span>
            <span className="block font-bold">{images.length ? "Adicionar mais fotos" : "Adicionar fotos"}</span>
            <span className="block text-sm text-muted">Tire na hora ou escolha da galeria. Arraste para reordenar; a primeira é a capa.</span>
          </span>
        </button>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      <p className="mt-2 text-xs text-faint">
        As fotos são reduzidas automaticamente (WebP, até 1600 px) antes de subir, para a loja carregar rápido.
      </p>
      {notice && <p className="mt-1 text-sm text-sign">{notice}</p>}
    </div>
  );
}
