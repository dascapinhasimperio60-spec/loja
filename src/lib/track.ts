"use client";

import { env } from "@/lib/env";

/**
 * Store analytics, written straight to Supabase (RPCs with the public key).
 * No Vercel function is involved, nothing personal is stored: only daily
 * counters per page, traffic source and device class.
 */
function rpc(fn: string, body: Record<string, unknown>) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) return;
  if (typeof navigator !== "undefined" && navigator.webdriver) return; // bots, headless browsers
  try {
    void fetch(`${env.supabaseUrl}/rest/v1/rpc/${fn}`, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${env.supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch {
    // analytics never blocks the page
  }
}

/** Counts a "Comprar" / WhatsApp click or a product view. */
export function trackClick(productId: string, kind: "ml" | "whatsapp" | "view" = "ml") {
  if (productId.startsWith("demo-")) return;
  rpc("register_click", { p_product_id: productId, p_kind: kind });
}

type Source = "instagram" | "whatsapp" | "google" | "facebook" | "tiktok" | "direto" | "outros";
type Session = { source: Source; seen: string[] };
const KEY = "imperio:sessao";

function detectSource(): Source {
  const utm = new URLSearchParams(window.location.search).get("utm_source")?.toLowerCase() ?? "";
  const ref = (() => {
    try {
      return document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
    } catch {
      return "";
    }
  })();
  const hint = `${utm} ${ref}`;
  if (/instagram|(^|\s)ig(\s|$)|l\.instagram/.test(hint)) return "instagram";
  if (/whatsapp|wa\.me/.test(hint)) return "whatsapp";
  if (/google\./.test(hint) || utm === "google") return "google";
  if (/facebook|fb\.com|(^|\s)fb(\s|$)/.test(hint)) return "facebook";
  if (/tiktok/.test(hint)) return "tiktok";
  if (!ref || ref === window.location.hostname) return utm ? "outros" : "direto";
  return "outros";
}

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(s: Session) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // private mode: counts still work, just without de-duplication
  }
}

/**
 * One page view per page per session; the first one also opens the session
 * (with its traffic source). Product pages also count a product view.
 */
export function trackVisit(page: "home" | "vitrine" | "produto", productId?: string) {
  const existing = readSession();
  const session: Session = existing ?? { source: detectSource(), seen: [] };
  const pageKey = productId ? `produto:${productId}` : page;
  if (session.seen.includes(pageKey)) return;

  session.seen = [...session.seen.slice(-80), pageKey];
  writeSession(session);

  const device = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768 ? "mobile" : "desktop";
  rpc("register_visit", { p_page: page, p_source: session.source, p_device: device, p_new_session: !existing });
  if (productId) trackClick(productId, "view");
}
