import { requireAdmin } from "@/lib/admin/auth";
import { env, hasSupabase } from "@/lib/env";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabase) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="text-3xl font-black uppercase wdth-expanded">Falta configurar o Supabase</h1>
        <p className="mt-4 text-muted">
          Crie o projeto no Supabase, rode o arquivo <code className="text-led">supabase/migrations/0001_init.sql</code> e preencha as variáveis de
          ambiente descritas no README. Depois disso o painel funciona.
        </p>
      </main>
    );
  }

  const { supabase, user } = await requireAdmin();
  const { count } = await supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true);

  return (
    <AdminShell email={user.email ?? ""} storeUrl={env.siteUrl} publishedCount={count ?? 0}>
      {children}
    </AdminShell>
  );
}
