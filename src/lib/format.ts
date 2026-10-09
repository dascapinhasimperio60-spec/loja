const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatPrice(value: number) {
  return brl.format(value);
}

/** "R$ 49,90" -> { int: "49", cents: "90" } for the price plaque. */
export function splitPrice(value: number) {
  const [int, cents = "00"] = value.toFixed(2).split(".");
  return { int: Number(int).toLocaleString("pt-BR"), cents };
}

export function discountPercent(price: number, compareAt: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function installments(price: number, max = 6) {
  // Display only; final conditions are decided by Mercado Livre.
  if (price < 30) return null;
  const n = Math.min(max, Math.floor(price / 10));
  return { n, value: brl.format(price / n) };
}

export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function whatsappLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  return phone;
}
