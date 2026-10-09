"use client";

import { env } from "@/lib/env";

/**
 * Counts a "Comprar" / WhatsApp click straight in Supabase (RPC with the
 * public anon key). No Vercel function is involved, and keepalive lets the
 * request finish while the Mercado Livre tab opens.
 */
export function trackClick(productId: string, kind: "ml" | "whatsapp" = "ml") {
  if (!env.supabaseUrl || !env.supabaseAnonKey || productId.startsWith("demo-")) return;
  try {
    void fetch(`${env.supabaseUrl}/rest/v1/rpc/register_click`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${env.supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_product_id: productId, p_kind: kind }),
    }).catch(() => {});
  } catch {
    // never block the purchase on analytics
  }
}
