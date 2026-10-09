"use client";

/**
 * Shrinks a photo in the browser before upload: WebP, 1600px long edge,
 * quality 0.8. Keeps the site light and ImageKit storage/bandwidth tiny.
 * Card thumbnails are derived later by ImageKit URL transforms (imagekit-url.ts).
 */
export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
};

const LARGE = { edge: 1600, quality: 0.8 };

async function render(bitmap: ImageBitmap, edge: number, quality: number) {
  const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu processar a imagem.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  // Old Safari cannot encode WebP; JPEG is the fallback.
  if (!blob || blob.type !== "image/webp") {
    const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!jpeg) throw new Error("Não foi possível comprimir a imagem.");
    return { blob: jpeg, width, height };
  }
  return { blob, width, height };
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!file.type.startsWith("image/")) throw new Error("Arquivo não é uma imagem.");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    return await render(bitmap, LARGE.edge, LARGE.quality);
  } finally {
    bitmap.close();
  }
}
