export type ProductImage = {
  id: string;
  url: string;
  thumb_url: string;
  storage_key: string;
  thumb_key: string;
  width: number;
  height: number;
  position: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  position: number;
};

export type Product = {
  id: string;
  code: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  ml_url: string;
  category_id: string | null;
  models: string[];
  material: string;
  includes: string;
  featured: boolean;
  active: boolean;
  sold_out: boolean;
  position: number;
  click_count: number;
  created_at: string;
  updated_at: string;
  images: ProductImage[];
};

export type Settings = {
  store_name: string;
  tagline: string;
  whatsapp: string;
  instagram: string;
  address: string;
  maps_url: string;
  opening_hours: string;
  announcement: string;
};

export type Catalog = {
  products: Product[];
  categories: Category[];
  settings: Settings;
  demo: boolean;
};
