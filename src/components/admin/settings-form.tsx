"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FloppyDisk, SpinnerGap } from "@phosphor-icons/react";
import { saveSettings, type SettingsInput } from "@/app/admin/actions";
import { formatPhone } from "@/lib/format";
import { useToast } from "./toast";
import type { Settings } from "@/lib/types";

const field = "h-12 w-full rounded-xl bg-panel-2 px-4 text-led ring-1 ring-white/[0.1] placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-sign";

const FIELDS: { key: keyof SettingsInput; label: string; hint?: string; placeholder?: string; type?: string }[] = [
  { key: "store_name", label: "Nome da loja" },
  { key: "tagline", label: "Frase do letreiro", placeholder: "Atacado e varejo & assistência técnica" },
  { key: "whatsapp", label: "WhatsApp", hint: "DDD + número", placeholder: "61 99312-5211", type: "tel" },
  { key: "instagram", label: "Instagram", hint: "sem o @", placeholder: "imperiodascapinhas25" },
  { key: "address", label: "Endereço da loja", placeholder: "Rua, número, bairro, cidade - DF" },
  { key: "maps_url", label: "Link do Google Maps", hint: "opcional", placeholder: "https://maps.app.goo.gl/...", type: "url" },
  { key: "opening_hours", label: "Horário de funcionamento", placeholder: "Seg a Sáb, 9h às 19h" },
  { key: "announcement", label: "Aviso no letreiro de LED", hint: "aparece rolando no topo", placeholder: "Enviamos para todo o Brasil" },
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [values, setValues] = useState<SettingsInput>({
    store_name: settings.store_name,
    tagline: settings.tagline,
    whatsapp: formatPhone(settings.whatsapp),
    instagram: settings.instagram,
    address: settings.address,
    maps_url: settings.maps_url,
    opening_hours: settings.opening_hours,
    announcement: settings.announcement,
  });

  return (
    <form
      className="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveSettings(values);
          if (!res.ok) return toast("error", res.error);
          toast("ok", "Dados da loja salvos. O site já foi atualizado.");
          router.refresh();
        });
      }}
    >
      <h1 className="text-3xl font-black uppercase tracking-[-0.02em] wdth-expanded">Dados da loja</h1>
      <p className="mt-1 text-muted">Aparecem no letreiro, no rodapé, na seção &quot;A loja&quot; e nos botões de WhatsApp.</p>

      <div className="mt-8 space-y-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <label htmlFor={f.key} className="text-sm font-bold">
                {f.label}
              </label>
              {f.hint && <span className="text-xs text-faint">{f.hint}</span>}
            </div>
            <input
              id={f.key}
              type={f.type ?? "text"}
              className={field}
              value={values[f.key] as string}
              placeholder={f.placeholder}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>

      <button type="submit" disabled={pending} className="plaque mt-8 px-6 py-3 text-base font-black uppercase wdth-semi disabled:opacity-60">
        {pending ? <SpinnerGap size={20} className="animate-spin" aria-hidden /> : <FloppyDisk size={20} weight="fill" aria-hidden />}
        Salvar
      </button>
    </form>
  );
}
