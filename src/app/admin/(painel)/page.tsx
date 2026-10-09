import Link from "next/link";
import { Plus, WarningCircle, ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { getAdminProducts, getAdminSettings, getClickStats } from "@/lib/admin/queries";
import { hasImageKit } from "@/lib/imagekit";

export const metadata = { title: "Painel" };

export default async function DashboardPage() {
  const [products, settings, stats] = await Promise.all([getAdminProducts(), getAdminSettings(), getClickStats(30)]);

  const published = products.filter((p) => p.active);
  const top = products
    .map((p) => ({ p, ...(stats.byProduct.get(p.id) ?? { ml: 0, whatsapp: 0 }) }))
    .filter((r) => r.ml + r.whatsapp > 0)
    .sort((a, b) => b.ml - a.ml || b.whatsapp - a.whatsapp)
    .slice(0, 8);

  const setup = [
    { done: hasImageKit, text: "Configurar o ImageKit para receber as fotos", href: null },
    { done: products.length > 0, text: "Cadastrar o primeiro produto", href: "/admin/produtos/novo" },
    { done: Boolean(settings.address), text: "Preencher endereço e horário da loja", href: "/admin/configuracoes" },
  ];
  const pending = setup.filter((s) => !s.done);

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-black uppercase tracking-[-0.02em] wdth-expanded sm:text-4xl">Painel</h1>
        <Link href="/admin/produtos/novo" className="plaque px-5 py-3 text-sm font-black uppercase wdth-semi">
          <Plus size={18} weight="bold" aria-hidden /> Novo produto
        </Link>
      </div>

      {pending.length > 0 && (
        <section className="mt-8 rounded-2xl bg-panel p-5 ring-1 ring-sign/25 sm:p-6" aria-labelledby="primeiros-passos">
          <h2 id="primeiros-passos" className="font-black uppercase wdth-semi">Primeiros passos</h2>
          <ul className="mt-4 space-y-2.5">
            {setup.map((s) => (
              <li key={s.text} className="flex items-center gap-3">
                {s.done ? <CheckCircle size={22} weight="fill" className="shrink-0 text-ok" aria-label="Feito" /> : <WarningCircle size={22} weight="fill" className="shrink-0 text-sign" aria-label="Pendente" />}
                {s.href && !s.done ? (
                  <Link href={s.href} className="font-semibold underline decoration-white/25 hover:decoration-sign">
                    {s.text}
                  </Link>
                ) : (
                  <span className={s.done ? "text-muted line-through" : "font-semibold"}>
                    {s.text}
                    {!s.done && !s.href && <span className="ml-2 text-sm font-normal text-muted">(veja o README)</span>}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.06] sm:grid-cols-3" aria-label="Resumo">
        <div className="bg-panel p-5">
          <p className="text-sm font-semibold text-muted">Na vitrine agora</p>
          <p className="mt-1 text-3xl font-black tabular wdth-semi">{published.length}</p>
          <p className="text-sm text-muted tabular">{products.length - published.length} rascunhos · {products.filter((p) => p.sold_out).length} esgotados</p>
        </div>
        <div className="bg-panel p-5">
          <p className="text-sm font-semibold text-muted">Cliques em &quot;Comprar&quot; (30 dias)</p>
          <p className="mt-1 text-3xl font-black text-sign tabular wdth-semi">{stats.ml}</p>
          <p className="text-sm text-muted">Clientes enviados ao Mercado Livre</p>
        </div>
        <div className="bg-panel p-5">
          <p className="text-sm font-semibold text-muted">Cliques no WhatsApp (30 dias)</p>
          <p className="mt-1 text-3xl font-black tabular wdth-semi">{stats.whatsapp}</p>
          <p className="text-sm text-muted">Dúvidas e avisos de reposição</p>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="mais-clicados">
        <div className="flex items-center justify-between">
          <h2 id="mais-clicados" className="text-lg font-black uppercase wdth-semi">Mais clicados nos últimos 30 dias</h2>
          <Link href="/admin/produtos" className="flex items-center gap-1 text-sm font-bold text-sign">
            Todos os produtos <ArrowRight size={14} weight="bold" aria-hidden />
          </Link>
        </div>
        {top.length ? (
          <ol className="mt-4 divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-panel ring-1 ring-white/[0.06]">
            {top.map(({ p, ml, whatsapp }) => (
              <li key={p.id}>
                <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-4 p-3 hover:bg-white/[0.03] sm:p-4">
                  <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-panel-3">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].thumb_url} alt="" className="size-full object-cover" loading="lazy" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{p.title}</span>
                    <span className="text-sm text-muted tabular">Cód. {p.code}</span>
                  </span>
                  <span className="text-right text-sm tabular">
                    <span className="block font-black text-sign">{ml} comprar</span>
                    <span className="block text-muted">{whatsapp} WhatsApp</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-2xl bg-panel p-6 text-muted ring-1 ring-white/[0.06]">
            Ainda sem cliques. Assim que os clientes tocarem em &quot;Comprar no Mercado Livre&quot;, os produtos mais procurados aparecem aqui.
          </p>
        )}
      </section>
    </div>
  );
}
