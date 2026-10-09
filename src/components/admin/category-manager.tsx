"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, Check, PencilSimple, X } from "@phosphor-icons/react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { useToast } from "./toast";
import type { Category } from "@/lib/types";

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okText: string, after?: () => void) {
    start(async () => {
      const res = await fn();
      if (!res.ok) return toast("error", res.error ?? "Erro.");
      toast("ok", okText);
      after?.();
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black uppercase tracking-[-0.02em] wdth-expanded">Categorias</h1>
      <p className="mt-1 text-muted">Usadas no filtro da vitrine. O cliente filtra principalmente pelo modelo do celular.</p>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 2) return;
          run(() => saveCategory({ name }), "Categoria criada.", () => setName(""));
        }}
      >
        <label className="flex-1">
          <span className="sr-only">Nova categoria</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            placeholder="Nova categoria, ex.: Suportes veiculares"
            className="h-12 w-full rounded-xl bg-panel-2 px-4 text-led ring-1 ring-white/[0.1] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sign"
          />
        </label>
        <button type="submit" disabled={pending || name.trim().length < 2} className="plaque px-5 font-black uppercase wdth-semi disabled:opacity-50">
          <Plus size={18} weight="bold" aria-hidden /> Criar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-panel ring-1 ring-white/[0.06]">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 p-3 pl-4">
            {editing === c.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => saveCategory({ id: c.id, name: editName }), "Categoria renomeada.", () => setEditing(null));
                }}
              >
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={40}
                  aria-label="Novo nome"
                  className="h-10 flex-1 rounded-lg bg-panel-2 px-3 text-led ring-1 ring-white/[0.1] focus:outline-none focus:ring-2 focus:ring-sign"
                />
                <button type="submit" className="flex size-10 items-center justify-center rounded-lg bg-sign text-on-sign" aria-label="Salvar nome">
                  <Check size={18} weight="bold" aria-hidden />
                </button>
                <button type="button" onClick={() => setEditing(null)} className="flex size-10 items-center justify-center rounded-lg text-led/70 hover:bg-white/[0.06]" aria-label="Cancelar">
                  <X size={18} aria-hidden />
                </button>
              </form>
            ) : (
              <>
                <span className="flex-1 font-semibold">{c.name}</span>
                <span className="text-sm text-muted tabular">{counts[c.id] ?? 0} produtos</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(c.id);
                    setEditName(c.name);
                  }}
                  className="flex size-10 items-center justify-center rounded-full text-led/70 hover:bg-white/[0.06] hover:text-led"
                  aria-label={`Renomear ${c.name}`}
                >
                  <PencilSimple size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const n = counts[c.id] ?? 0;
                    if (!window.confirm(n ? `Excluir "${c.name}"? ${n} produto(s) ficarão sem categoria.` : `Excluir "${c.name}"?`)) return;
                    run(() => deleteCategory(c.id), "Categoria excluída.");
                  }}
                  className="flex size-10 items-center justify-center rounded-full text-led/70 hover:bg-danger/10 hover:text-danger"
                  aria-label={`Excluir ${c.name}`}
                >
                  <Trash size={18} aria-hidden />
                </button>
              </>
            )}
          </li>
        ))}
        {categories.length === 0 && <li className="p-6 text-center text-muted">Nenhuma categoria ainda.</li>}
      </ul>
    </div>
  );
}
