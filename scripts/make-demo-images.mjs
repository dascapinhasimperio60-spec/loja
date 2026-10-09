// Renders synthetic product shots for the demo shelf (shown only while the
// store has no real products). Output: public/demo/*.webp
// Every file is labeled synthetic in demo-data.ts and replaced by the
// shopkeeper's own photos as soon as one product is published.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public/demo", { recursive: true });

const W = 800;
const H = 1000;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}

function lens(cx, cy, r) {
  return `
    <circle cx="${cx}" cy="${cy}" r="${r + 9}" fill="rgba(0,0,0,0.35)"/>
    <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="url(#ring)"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#glass)"/>
    <circle cx="${cx - r * 0.3}" cy="${cy - r * 0.35}" r="${r * 0.22}" fill="rgba(255,255,255,0.35)"/>`;
}

function caseSvg({ color, backdrop, layout = "pro", style = "silicone", angle = -8, ring = false }) {
  const cw = 380;
  const ch = 780;
  const x = (W - cw) / 2;
  const y = (H - ch) / 2 + 10;
  const rx = 74;
  const isClear = style === "clear";
  const body = isClear ? "rgba(235,240,245,0.28)" : color;

  const camW = layout === "pro" ? 172 : layout === "dual" ? 120 : 92;
  const camH = layout === "pro" ? 172 : layout === "dual" ? 172 : 250;
  const camX = x + 30;
  const camY = y + 30;

  let lenses = "";
  if (layout === "pro") {
    lenses = lens(camX + 50, camY + 50, 30) + lens(camX + 50, camY + 122, 30) + lens(camX + 122, camY + 86, 30);
  } else if (layout === "dual") {
    lenses = lens(camX + 60, camY + 48, 30) + lens(camX + 60, camY + 124, 30);
  } else {
    lenses = lens(camX + 46, camY + 48, 27) + lens(camX + 46, camY + 125, 27) + lens(camX + 46, camY + 202, 27);
  }

  const magsafe = ring
    ? `<circle cx="${W / 2}" cy="${y + ch * 0.56}" r="118" fill="none" stroke="${isClear ? "rgba(255,255,255,0.75)" : shade(color, -28)}" stroke-width="10"/>
       <rect x="${W / 2 - 5}" y="${y + ch * 0.56 + 124}" width="10" height="46" rx="5" fill="${isClear ? "rgba(255,255,255,0.75)" : shade(color, -28)}"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="${shade(backdrop, 18)}"/>
      <stop offset="1" stop-color="${shade(backdrop, -26)}"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="0.18" stop-color="rgba(255,255,255,0.04)"/>
      <stop offset="0.7" stop-color="rgba(0,0,0,0)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0.28)"/>
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#d9d9de"/><stop offset="0.5" stop-color="#6b6b72"/><stop offset="1" stop-color="#c9c9cf"/>
    </linearGradient>
    <radialGradient id="glass" cx="40%" cy="35%" r="70%">
      <stop offset="0" stop-color="#3a4a66"/><stop offset="0.55" stop-color="#0d1017"/><stop offset="1" stop-color="#000"/>
    </radialGradient>
    <filter id="drop" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="22"/>
      <feOffset dx="18" dy="34"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.38"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
  <g transform="rotate(${angle} ${W / 2} ${H / 2})" filter="url(#drop)">
    ${isClear ? `<rect x="${x + 10}" y="${y + 10}" width="${cw - 20}" height="${ch - 20}" rx="${rx - 8}" fill="#1b1d22"/>` : ""}
    <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="${rx}" fill="${body}" stroke="${isClear ? "rgba(255,255,255,0.55)" : shade(color, -22)}" stroke-width="${isClear ? 6 : 3}"/>
    <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="${rx}" fill="url(#sheen)"/>
    <rect x="${camX}" y="${camY}" width="${camW}" height="${camH}" rx="44" fill="${isClear ? "rgba(20,22,28,0.9)" : shade(color, -18)}" stroke="${isClear ? "rgba(255,255,255,0.4)" : shade(color, 14)}" stroke-width="3"/>
    ${lenses}
    ${magsafe}
    <rect x="${x - 4}" y="${y + 190}" width="8" height="74" rx="4" fill="${isClear ? "rgba(255,255,255,0.5)" : shade(color, -30)}"/>
    <rect x="${x - 4}" y="${y + 284}" width="8" height="74" rx="4" fill="${isClear ? "rgba(255,255,255,0.5)" : shade(color, -30)}"/>
  </g>
</svg>`;
}

const shots = [
  ["silicone-lavanda", { color: "#b9a8e6", backdrop: "#e8e4f2", layout: "pro", ring: true }],
  ["silicone-lavanda-2", { color: "#b9a8e6", backdrop: "#d9d3ec", layout: "pro", ring: true, angle: 12 }],
  ["silicone-azul", { color: "#2d4a8a", backdrop: "#d7dde8", layout: "pro", ring: true, angle: 6 }],
  ["silicone-azul-2", { color: "#2d4a8a", backdrop: "#c8d0de", layout: "pro", ring: true, angle: -14 }],
  ["silicone-rosa", { color: "#f2a7bd", backdrop: "#f4e3e8", layout: "dual", angle: -6 }],
  ["silicone-rosa-2", { color: "#f2a7bd", backdrop: "#ecd3db", layout: "dual", angle: 10 }],
  ["silicone-verde", { color: "#4f7a5a", backdrop: "#dfe6df", layout: "pro", ring: true, angle: 9 }],
  ["clear-magsafe", { color: "#ffffff", backdrop: "#d6d8dc", layout: "pro", style: "clear", ring: true, angle: -10 }],
  ["clear-magsafe-2", { color: "#ffffff", backdrop: "#c9ccd2", layout: "pro", style: "clear", ring: true, angle: 7 }],
  ["silicone-laranja", { color: "#f07c2e", backdrop: "#f2e2d4", layout: "dual", angle: 8 }],
  ["silicone-preto", { color: "#1d1d20", backdrop: "#d4d4d6", layout: "pro", ring: true, angle: -5 }],
  ["galaxy-grafite", { color: "#3b3d45", backdrop: "#dadbe0", layout: "vertical", angle: -9 }],
  ["galaxy-menta", { color: "#9fd8c4", backdrop: "#e0eee8", layout: "vertical", angle: 7 }],
  ["moto-vinho", { color: "#7a2236", backdrop: "#ead9dc", layout: "dual", angle: -7 }],
  ["redmi-amarelo", { color: "#ffcc29", backdrop: "#efe7cf", layout: "vertical", angle: 9 }],
  ["silicone-vermelho", { color: "#d1242f", backdrop: "#f0dcdc", layout: "pro", ring: true, angle: 5 }],
];

for (const [name, opts] of shots) {
  const svg = Buffer.from(caseSvg(opts));
  await sharp(svg).webp({ quality: 80 }).toFile(`public/demo/${name}.webp`);
  await sharp(svg).resize({ width: 400 }).webp({ quality: 72 }).toFile(`public/demo/${name}-sm.webp`);
}
console.log(`demo images: ${shots.length}`);
