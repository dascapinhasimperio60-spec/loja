import "server-only";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

/** Use at the top of every admin page/action. Returns the authed client. */
export async function requireAdmin() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?erro=sem-permissao");

  return { supabase, user };
}

/** Safe to show to the shopkeeper. */
export class AuthError extends Error {
  name = "AuthError";
}

/** For server actions: same check, but throws instead of redirecting. */
export async function assertAdmin() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Sessão expirada. Entre novamente.");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new AuthError("Sua conta não tem permissão de lojista.");
  return { supabase, user };
}
