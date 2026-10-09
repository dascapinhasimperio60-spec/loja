import Link from "next/link";
import { WarningCircle, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { getAdminCategories, getAdminProducts, getAdminSettings } from "@/lib/admin/queries";
import { getDashboard } from "@/lib/admin/analytics";
import { hasImageKit } from "@/lib/imagekit";
import { PERIODS, type Period } from "@/lib/analytics-types";
import { Dashboard } from "@/components/admin/dashboard/dashboard";

export const metadata = { title: "Visão geral" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ periodo?: string }> }) {
  const { periodo } = await searchParams;
  const period = (PERIODS as readonly number[]).includes(Number(periodo)) ? (Number(periodo) as Period) : 30;

  const [products, categories, settings] = await Promise.all([getAdminProducts(), getAdminCategories(), getAdminSettings()]);
  const data = await getDashboard(period, products, categories);

  const setup = [
    { done: hasImageKit, text: "Configurar o ImageKit para receber as fotos", href: null },
    { done: products.length > 0, text: "Cadastrar o primeiro produto", href: "/admin/produtos/novo" },
    { done: Boolean(settings.address), text: "Preencher endereço e horário da loja", href: "/admin/configuracoes" },
  ];
  const pending = setup.filter((s) => !s.done);

  return (
    <div className="mx-auto max-w-[1280px]">
      {pending.length > 0 && (
        <section className="mb-6 rounded-2xl bg-panel p-5 ring-1 ring-sign/25 print:hidden" aria-labelledby="primeiros-passos">
          <h2 id="primeiros-passos" className="text-sm font-black uppercase wdth-semi">Primeiros passos</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {setup.map((s) => (
              <li key={s.text} className="flex items-center gap-2 text-sm">
                {s.done ? (
                  <CheckCircle size={18} weight="fill" className="shrink-0 text-ok" aria-label="Feito" />
                ) : (
                  <WarningCircle size={18} weight="fill" className="shrink-0 text-sign" aria-label="Pendente" />
                )}
                {s.href && !s.done ? (
                  <Link href={s.href} className="font-semibold underline decoration-white/25 hover:decoration-sign">
                    {s.text}
                  </Link>
                ) : (
                  <span className={s.done ? "text-muted line-through" : "font-semibold"}>{s.text}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <Dashboard data={data} />
    </div>
  );
}
