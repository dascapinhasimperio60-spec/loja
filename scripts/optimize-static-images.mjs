// Converts the brand/store source photos (assets-src/) into light WebP files
// in public/brand/. Run once: `npm run optimize:images`.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "assets-src";
const OUT = "public/brand";
mkdirSync(OUT, { recursive: true });

const photos = [
  ["loja-parede-capinhas.jpg", 1280, 72],
  ["loja-corredor.jpg", 1280, 72],
  ["loja-balcao.jpg", 1280, 72],
  ["loja-letreiro.jpg", 1280, 72],
  ["loja-parede-apple.jpg", 720, 74],
  ["loja-fachada-rua.jpg", 720, 72],
];

for (const [file, width, quality] of photos) {
  const name = file.replace(/\.jpg$/, "");
  await sharp(`${SRC}/${file}`).resize({ width, withoutEnlargement: true }).webp({ quality, effort: 6 }).toFile(`${OUT}/${name}.webp`);
  await sharp(`${SRC}/${file}`).resize({ width: Math.round(width / 2) }).webp({ quality: 68, effort: 6 }).toFile(`${OUT}/${name}-sm.webp`);
}

// Full logo (keeps its yellow plate).
await sharp(`${SRC}/logo.jpg`).webp({ quality: 86, effort: 6 }).toFile(`${OUT}/logo.webp`);

// Crown + phone mark: clean alpha cut-out (see cut-mark.mjs).
await import("./cut-mark.mjs");

// Favicons from the mark on the brand yellow.
const yellow = { r: 255, g: 214, b: 10, alpha: 1 };
const markPng = await sharp(`${OUT}/mark.png`).toBuffer();
for (const size of [32, 180, 512]) {
  const inner = Math.round(size * 0.78);
  const icon = await sharp(markPng).resize({ height: inner, fit: "inside" }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: yellow } })
    .composite([{ input: icon, gravity: "center" }])
    .png()
    .toFile(size === 180 ? "src/app/apple-icon.png" : size === 32 ? "src/app/icon.png" : `${OUT}/icon-512.png`);
}

console.log("brand images ready");
