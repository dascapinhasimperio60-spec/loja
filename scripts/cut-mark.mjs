// Clean alpha cut-out of the crown + phone mark: key the yellow, then keep
// only the connected shape that contains the phone (drops neighbouring glyphs).
import sharp from "sharp";

const L = 100, T = 0, W = 300, H = 400;
const { data, info } = await sharp("assets-src/logo.jpg").extract({ left: L, top: T, width: W, height: H }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const n = W * H;
const solid = new Uint8Array(n);
for (let i = 0; i < n; i++) {
  const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
  const d = Math.hypot(r - 255, g - 204, b - 42);
  solid[i] = d > 95 ? 1 : 0;
}
// flood fill from the phone's centre and the crown
const keep = new Uint8Array(n);
const stack = [];
for (const [x, y] of [[95, 260], [70, 70], [130, 60]]) stack.push(y * W + x);
while (stack.length) {
  const p = stack.pop();
  if (keep[p] || !solid[p]) continue;
  keep[p] = 1;
  const x = p % W, y = (p / W) | 0;
  if (x > 0) stack.push(p - 1);
  if (x < W - 1) stack.push(p + 1);
  if (y > 0) stack.push(p - W);
  if (y < H - 1) stack.push(p + W);
}
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let i = 0; i < n; i++) {
  const x = i % W, y = (i / W) | 0;
  if (!keep[i]) {
    // soft edge: keep anti-aliased pixels touching the kept shape
    const near = (x > 0 && keep[i - 1]) || (x < W - 1 && keep[i + 1]) || (y > 0 && keep[i - W]) || (y < H - 1 && keep[i + W]);
    if (near) {
      const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
      const d = Math.hypot(r - 255, g - 204, b - 42);
      data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(((d - 40) / 55) * 255)));
    } else data[i * 4 + 3] = 0;
  } else {
    data[i * 4 + 3] = 255;
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  }
}
const pad = 3;
const box = { left: Math.max(0, minX - pad), top: Math.max(0, minY - pad), width: Math.min(W, maxX + pad + 1) - Math.max(0, minX - pad), height: Math.min(H, maxY + pad + 1) - Math.max(0, minY - pad) };
const img = sharp(data, { raw: info }).extract(box);
await img.clone().png({ compressionLevel: 9 }).toFile("public/brand/mark.png");
await img.clone().webp({ quality: 90, alphaQuality: 95 }).toFile("public/brand/mark.webp");
console.log("mark", box.width, box.height, "touches right edge:", maxX >= W - 1, "bottom:", maxY >= H - 1);
