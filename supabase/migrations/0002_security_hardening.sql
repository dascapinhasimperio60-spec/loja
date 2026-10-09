-- Império das Capinhas: endurecimento de segurança
-- Rode este arquivo inteiro no SQL Editor do Supabase (depois do 0001).
-- Pode ser executado mais de uma vez sem problema.

-- ---------------------------------------------------------------------------
-- 1. Visitantes não leem dados internos
--    Os contadores de cliques (click_count, last_click_at) e as chaves dos
--    arquivos no ImageKit (storage_key, thumb_key) deixam de ser públicos.
--    O painel continua lendo tudo (papel "authenticated" + RLS de admin).
-- ---------------------------------------------------------------------------
revoke select on public.products from anon;
grant select (
  id, code, slug, title, description, price, compare_at_price, ml_url, category_id,
  models, material, includes, featured, active, sold_out, position, created_at, updated_at
) on public.products to anon;

revoke select on public.product_images from anon;
grant select (id, product_id, url, thumb_url, width, height, position, created_at)
  on public.product_images to anon;

-- Visitantes nunca escrevem (as policies já bloqueiam; aqui tiramos até o privilégio).
revoke insert, update, delete, truncate on
  public.products, public.product_images, public.categories, public.settings,
  public.admins, public.click_daily
from anon;

-- ---------------------------------------------------------------------------
-- 2. Funções internas não ficam expostas na API
-- ---------------------------------------------------------------------------
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.touch_products_updated_at() from public, anon, authenticated;

-- ===========================================================================
-- 3. Métricas do dashboard (o contador de cliques ganha teto diário anti-robô)
--    Tudo agregado por dia (tabelas pequenas, plano gratuito tranquilo).
-- ===========================================================================

-- 3a. Visualizações de produto entram na mesma tabela diária dos cliques.
alter table public.click_daily drop constraint if exists click_daily_kind_check;
alter table public.click_daily add constraint click_daily_kind_check check (kind in ('ml', 'whatsapp', 'view'));

create or replace function public.register_click(p_product_id uuid, p_kind text default 'ml')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind text := case when p_kind in ('whatsapp', 'view') then p_kind else 'ml' end;
  v_day date := (now() at time zone 'America/Sao_Paulo')::date;
  v_cap integer := case when p_kind = 'view' then 20000 else 3000 end;
  v_count integer;
begin
  if not exists (select 1 from products where id = p_product_id and active) then
    return;
  end if;

  select count into v_count from click_daily
   where product_id = p_product_id and day = v_day and kind = v_kind;
  if coalesce(v_count, 0) >= v_cap then
    return;
  end if;

  if v_kind = 'ml' then
    update products
      set click_count = click_count + 1, last_click_at = now()
      where id = p_product_id;
  end if;

  insert into click_daily (product_id, day, kind, count)
    values (p_product_id, v_day, v_kind, 1)
    on conflict (product_id, day, kind) do update set count = click_daily.count + 1;
end;
$$;

revoke all on function public.register_click(uuid, text) from public;
grant execute on function public.register_click(uuid, text) to anon, authenticated;

-- 3b. Visitas: página, origem e dispositivo, por dia.
create table if not exists public.visits_daily (
  day date not null,
  page text not null check (page in ('home', 'vitrine', 'produto', 'outra')),
  source text not null check (source in ('instagram', 'whatsapp', 'google', 'facebook', 'tiktok', 'direto', 'outros')),
  device text not null check (device in ('mobile', 'desktop')),
  sessions integer not null default 0,
  pageviews integer not null default 0,
  primary key (day, page, source, device)
);

alter table public.visits_daily enable row level security;
drop policy if exists visits_daily_read on public.visits_daily;
create policy visits_daily_read on public.visits_daily
  for select to authenticated using ((select public.is_admin()));
revoke all on public.visits_daily from anon;

create or replace function public.register_visit(p_page text, p_source text, p_device text, p_new_session boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'America/Sao_Paulo')::date;
  v_page text := case when p_page in ('home', 'vitrine', 'produto') then p_page else 'outra' end;
  v_source text := case when p_source in ('instagram', 'whatsapp', 'google', 'facebook', 'tiktok', 'direto') then p_source else 'outros' end;
  v_device text := case when p_device = 'mobile' then 'mobile' else 'desktop' end;
  v_views integer;
begin
  select pageviews into v_views from visits_daily
   where day = v_day and page = v_page and source = v_source and device = v_device;
  if coalesce(v_views, 0) >= 100000 then
    return;
  end if;

  insert into visits_daily (day, page, source, device, sessions, pageviews)
    values (v_day, v_page, v_source, v_device, case when p_new_session then 1 else 0 end, 1)
    on conflict (day, page, source, device) do update
      set pageviews = visits_daily.pageviews + 1,
          sessions = visits_daily.sessions + case when p_new_session then 1 else 0 end;
end;
$$;

revoke all on function public.register_visit(text, text, text, boolean) from public;
grant execute on function public.register_visit(text, text, text, boolean) to anon, authenticated;

-- 3c. Tudo o que o dashboard precisa num só pedido (só para admins).
--     Período atual = [p_split, p_to]; período anterior = [p_from, p_split).
drop function if exists public.dashboard_stats(date, date);
create or replace function public.dashboard_stats(p_from date, p_split date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if not (p_from <= p_split and p_split <= p_to) or p_to - p_from > 800 then
    raise exception 'invalid range' using errcode = '22023';
  end if;

  with days as (
    select d::date as day from generate_series(p_from, p_to, interval '1 day') d
  ),
  v as (
    select day, sum(sessions) as sessions, sum(pageviews) as pageviews
      from visits_daily where day between p_from and p_to group by day
  ),
  c as (
    select day,
           sum(count) filter (where kind = 'view') as views,
           sum(count) filter (where kind = 'ml') as ml,
           sum(count) filter (where kind = 'whatsapp') as whatsapp
      from click_daily where day between p_from and p_to group by day
  )
  select jsonb_build_object(
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', days.day,
        'sessions', coalesce(v.sessions, 0),
        'pageviews', coalesce(v.pageviews, 0),
        'views', coalesce(c.views, 0),
        'ml', coalesce(c.ml, 0),
        'whatsapp', coalesce(c.whatsapp, 0)
      ) order by days.day), '[]'::jsonb)
      from days left join v on v.day = days.day left join c on c.day = days.day
    ),
    'products', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'product_id', product_id,
        'views', views, 'ml', ml, 'whatsapp', whatsapp,
        'prev_views', prev_views, 'prev_ml', prev_ml, 'prev_whatsapp', prev_whatsapp
      )), '[]'::jsonb)
      from (
        select product_id,
               coalesce(sum(count) filter (where kind = 'view' and day >= p_split), 0) as views,
               coalesce(sum(count) filter (where kind = 'ml' and day >= p_split), 0) as ml,
               coalesce(sum(count) filter (where kind = 'whatsapp' and day >= p_split), 0) as whatsapp,
               coalesce(sum(count) filter (where kind = 'view' and day < p_split), 0) as prev_views,
               coalesce(sum(count) filter (where kind = 'ml' and day < p_split), 0) as prev_ml,
               coalesce(sum(count) filter (where kind = 'whatsapp' and day < p_split), 0) as prev_whatsapp
          from click_daily
         where day between p_from and p_to
         group by product_id
      ) per_product
    ),
    'visits', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'page', page, 'source', source, 'device', device,
        'sessions', sessions, 'pageviews', pageviews,
        'prev_sessions', prev_sessions, 'prev_pageviews', prev_pageviews
      )), '[]'::jsonb)
      from (
        select page, source, device,
               coalesce(sum(sessions) filter (where day >= p_split), 0) as sessions,
               coalesce(sum(pageviews) filter (where day >= p_split), 0) as pageviews,
               coalesce(sum(sessions) filter (where day < p_split), 0) as prev_sessions,
               coalesce(sum(pageviews) filter (where day < p_split), 0) as prev_pageviews
          from visits_daily
         where day between p_from and p_to
         group by page, source, device
      ) per_segment
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.dashboard_stats(date, date, date) from public, anon;
grant execute on function public.dashboard_stats(date, date, date) to authenticated;
