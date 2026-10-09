/** Shapes shared by the dashboard server builder and its client components. */

export const PERIODS = [7, 30, 90, 365] as const;
export type Period = (typeof PERIODS)[number];

export type Metric = "sessions" | "pageviews" | "views" | "ml" | "whatsapp";

export const METRIC_LABEL: Record<Metric, string> = {
  sessions: "Visitantes",
  pageviews: "Páginas vistas",
  views: "Produtos vistos",
  ml: "Cliques em Comprar",
  whatsapp: "Cliques no WhatsApp",
};

export type DailyPoint = { day: string } & Record<Metric, number>;

export type Totals = Record<Metric, number> & {
  /** clicks on "Comprar" per product view */
  ctr: number;
  /** sum of price x "Comprar" clicks: an estimate of purchase intent, not sales */
  intent: number;
};

export type Slice = { key: string; label: string; value: number; prev: number };

export type ProductRow = {
  id: string;
  code: number;
  title: string;
  slug: string;
  price: number;
  category: string;
  brands: string[];
  active: boolean;
  sold_out: boolean;
  featured: boolean;
  thumb: string | null;
  views: number;
  ml: number;
  whatsapp: number;
  prev_ml: number;
  ctr: number;
  intent: number;
};

export type DashboardData = {
  period: Period;
  from: string;
  to: string;
  /** first day of the comparison window (the previous period) */
  compareFrom: string;
  daily: DailyPoint[];
  prevDaily: DailyPoint[];
  totals: Totals;
  prevTotals: Totals;
  sources: Slice[];
  devices: Slice[];
  pages: Slice[];
  categories: Slice[];
  brands: Slice[];
  weekdays: Slice[];
  products: ProductRow[];
  health: {
    published: number;
    drafts: number;
    soldOut: number;
    featured: number;
    noModels: number;
    noCategory: number;
    stale: ProductRow[];
  };
  /** true when the analytics tables are missing (0002 migration not run yet) */
  needsMigration: boolean;
  demo?: boolean;
};
