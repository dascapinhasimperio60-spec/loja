import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/env";
import { getPublicSupabase } from "@/lib/supabase/server";

/**
 * Daily Vercel Cron (vercel.json). Supabase free projects pause after 7 days
 * without activity; one tiny read a day keeps the database awake.
 * Vercel sends "Authorization: Bearer <CRON_SECRET>"; anything else is refused.
 */
export const dynamic = "force-dynamic";

function authorized(header: string | null, secret: string) {
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header ?? "");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") return NextResponse.json({ ok: false }, { status: 503 });
  } else if (!authorized(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!hasSupabase) return NextResponse.json({ ok: true, skipped: "supabase not configured" });
  const { error } = await getPublicSupabase().from("settings").select("id").eq("id", 1).maybeSingle();
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200, headers: { "Cache-Control": "no-store" } });
}
