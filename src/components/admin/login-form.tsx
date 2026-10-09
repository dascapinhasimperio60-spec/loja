"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, SpinnerGap } from "@phosphor-icons/react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

const MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme o e-mail antes de entrar.",
};

export function LoginForm({ initialError }: { initialError: string | null }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await getBrowserSupabase().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(MESSAGES[error.message] ?? "Não foi possível entrar. Tente de novo.");
      setLoading(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-bold">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-xl bg-panel-2 px-4 text-led ring-1 ring-white/[0.1] focus:outline-none focus:ring-2 focus:ring-sign"
        />
      </div>
      <div>
        <label htmlFor="senha" className="mb-1.5 block text-sm font-bold">Senha</label>
        <div className="relative">
          <input
            id="senha"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl bg-panel-2 pl-4 pr-12 text-led ring-1 ring-white/[0.1] focus:outline-none focus:ring-2 focus:ring-sign"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-1 top-1 flex size-10 items-center justify-center rounded-lg text-muted hover:text-led"
            aria-label={show ? "Esconder senha" : "Mostrar senha"}
          >
            {show ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger ring-1 ring-danger/30">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className="plaque flex h-12 w-full items-center justify-center text-base font-black uppercase wdth-semi disabled:opacity-60"
      >
        {loading ? <SpinnerGap size={22} className="animate-spin" aria-label="Entrando" /> : "Entrar"}
      </button>
    </form>
  );
}
