import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/env";
import { getPublicSupabase } from "@/lib/supabase/server";

/**
 * Daily Vercel Cron (vercel.json). Supabase free projects pause after 7 days
 * without activity; one tiny read a day keeps the database awake.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!hasSupabase) return NextResponse.json({ ok: true, skipped: "supabase not configured" });
  const { error } = await getPublicSupabase().from("settings").select("id").eq("id", 1).maybeSingle();
  return NextResponse.json({ ok: !error, at: new Date().toISOString() }, { status: error ? 500 : 200 });
}
