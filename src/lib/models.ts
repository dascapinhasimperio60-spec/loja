/** Phone model helpers: brand grouping for the "Qual é o seu celular?" picker. */

export const BRANDS = ["Apple", "Samsung", "Motorola", "Xiaomi", "Realme", "LG", "Asus", "Outros"] as const;
export type Brand = (typeof BRANDS)[number];

export function brandOf(model: string): Brand {
  const m = model.toLowerCase();
  if (m.startsWith("iphone") || m.startsWith("ipad") || m.includes("apple") || m.includes("airpods")) return "Apple";
  if (m.startsWith("galaxy") || m.includes("samsung")) return "Samsung";
  if (m.startsWith("moto") || m.includes("motorola") || m.startsWith("edge")) return "Motorola";
  if (m.startsWith("redmi") || m.startsWith("poco") || m.includes("xiaomi") || m.startsWith("mi ")) return "Xiaomi";
  if (m.startsWith("realme")) return "Realme";
  if (m.startsWith("lg")) return "LG";
  if (m.startsWith("asus") || m.startsWith("zenfone") || m.startsWith("rog")) return "Asus";
  return "Outros";
}

export function modelSlug(model: string) {
  return model
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Natural sort so "iPhone 9" < "iPhone 11" < "iPhone 11 Pro". Newest numbers first. */
export function sortModels(models: string[]) {
  return [...models].sort((a, b) => b.localeCompare(a, "pt-BR", { numeric: true }));
}

export function groupModels(models: string[]) {
  const groups = new Map<Brand, string[]>();
  for (const model of models) {
    const brand = brandOf(model);
    groups.set(brand, [...(groups.get(brand) ?? []), model]);
  }
  return BRANDS.filter((b) => groups.has(b)).map((brand) => ({ brand, models: sortModels(groups.get(brand)!) }));
}

/** Suggestions offered in the admin model picker. */
export const MODEL_SUGGESTIONS = [
  "iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17 Air", "iPhone 17",
  "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 16e",
  "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
  "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
  "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 mini",
  "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11",
  "iPhone XR", "iPhone SE",
  "Galaxy S25 Ultra", "Galaxy S25+", "Galaxy S25", "Galaxy S24 Ultra", "Galaxy S24 FE", "Galaxy S24",
  "Galaxy A56", "Galaxy A55", "Galaxy A36", "Galaxy A35", "Galaxy A26", "Galaxy A25", "Galaxy A16", "Galaxy A15", "Galaxy A06", "Galaxy A05s",
  "Moto G85", "Moto G75", "Moto G55", "Moto G54", "Moto G35", "Moto G34", "Moto G24", "Moto G15", "Moto Edge 50",
  "Redmi Note 14 Pro", "Redmi Note 14", "Redmi Note 13 Pro", "Redmi Note 13", "Redmi 14C", "Redmi 13C", "Poco X7 Pro", "Poco X6 Pro",
  "Realme C75", "Realme C67", "Realme 12",
];
