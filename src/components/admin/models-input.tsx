"use client";

import { useMemo, useState } from "react";
import { X, Plus } from "@phosphor-icons/react";
import { MODEL_SUGGESTIONS } from "@/lib/models";

/** Tag input for compatible phone models, with quick suggestions. */
export function ModelsInput({ value, onChange, known = [] }: { value: string[]; onChange: (v: string[]) => void; known?: string[] }) {
  const [draft, setDraft] = useState("");
  const pool = useMemo(() => Array.from(new Set([...known, ...MODEL_SUGGESTIONS])), [known]);

  const matches = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return [];
    return pool.filter((m) => m.toLowerCase().includes(q) && !value.includes(m)).slice(0, 8);
  }, [draft, pool, value]);

  function add(model: string) {
    const m = model.trim().replace(/\s+/g, " ");
    if (!m || value.includes(m)) return setDraft("");
    onChange([...value, m]);
    setDraft("");
  }

  return (
    <div>
      <div className="flex min-h-12 flex-wrap items-center gap-1.5 rounded-xl bg-panel-2 p-1.5 ring-1 ring-white/[0.1] focus-within:ring-2 focus-within:ring-sign">
        {value.map((m) => (
          <span key={m} className="flex items-center gap-1 rounded-lg bg-sign py-1 pl-2.5 pr-1 text-sm font-bold text-on-sign">
            {m}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== m))} className="flex size-6 items-center justify-center rounded-md hover:bg-black/10" aria-label={`Remover ${m}`}>
              <X size={12} weight="bold" aria-hidden />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(matches[0] && draft.trim().length >= 3 && matches[0].toLowerCase().startsWith(draft.trim().toLowerCase()) ? matches[0] : draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={value.length ? "Adicionar outro modelo" : "Ex.: iPhone 15 Pro Max"}
          className="h-9 min-w-[10rem] flex-1 bg-transparent px-2 text-led placeholder:text-faint focus:outline-none"
          aria-label="Adicionar modelo compatível"
        />
      </div>
      {matches.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {matches.map((m) => (
            <button
              key={m}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(m)}
              className="flex items-center gap-1 rounded-lg bg-panel-3 px-2.5 py-1.5 text-sm font-semibold text-led/90 hover:bg-white/[0.12]"
            >
              <Plus size={12} weight="bold" aria-hidden /> {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
