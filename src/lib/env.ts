export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  adminUrl: (process.env.NEXT_PUBLIC_ADMIN_URL ?? "").replace(/\/$/, ""),
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);
