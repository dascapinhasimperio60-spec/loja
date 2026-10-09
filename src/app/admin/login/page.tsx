import { LoginForm } from "@/components/admin/login-form";
import { Wordmark } from "@/components/store/wordmark";
import { hasSupabase } from "@/lib/env";

export const metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="slatwall grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-[25rem]">
        <div className="mb-8 flex justify-center">
          <Wordmark />
        </div>
        <div className="rounded-[1.5rem] bg-ink/90 p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,1)] ring-1 ring-white/[0.08] sm:p-8">
          <h1 className="text-2xl font-black uppercase tracking-[-0.02em] wdth-expanded">Painel do lojista</h1>
          <p className="mt-1.5 text-sm text-muted">Entre com o e-mail e a senha cadastrados no Supabase.</p>
          {!hasSupabase ? (
            <p className="mt-6 rounded-xl bg-danger/10 p-4 text-sm text-danger ring-1 ring-danger/30">
              O Supabase ainda não foi configurado. Preencha as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (veja o README).
            </p>
          ) : (
            <LoginForm initialError={erro === "sem-permissao" ? "Essa conta não tem permissão de lojista. Peça para liberar o acesso (tabela admins)." : null} />
          )}
        </div>
      </div>
    </main>
  );
}
