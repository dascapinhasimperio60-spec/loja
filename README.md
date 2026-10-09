# Império das Capinhas: loja + painel

Vitrine online da Império das Capinhas. O cliente vê as fotos reais do estoque, o preço e os modelos compatíveis, e finaliza a compra no **Mercado Livre**. O lojista cadastra tudo num painel próprio.

- **Loja**: `imperiodascapinhas.com.br`, com home, vitrine filtrável por modelo e página de produto
- **Painel**: `admin.imperiodascapinhas.com.br`, com produtos, fotos, preços, categorias, dados da loja e cliques

Um único projeto Next.js na Vercel atende os dois endereços.

---

## Stack e por que cabe no plano gratuito

| Serviço | Papel | Cuidados para não estourar o grátis |
|---|---|---|
| **Vercel (Hobby)** | Hospeda o site | As páginas da loja são **estáticas** e ficam no CDN. Só são regeradas quando o lojista salva algo (revalidação sob demanda). Otimização de imagem da Vercel **desligada**. O proxy (middleware) roda **só no /admin**. O subdomínio é resolvido por `redirects` (sem função). |
| **Supabase (Free)** | Banco + login do lojista | O visitante **nunca** consulta o Supabase direto: o catálogo inteiro é lido 1 vez e cacheado. Cliques em "Comprar" são somados por dia (1 linha por produto/dia). Um cron diário evita que o projeto pause por inatividade. |
| **ImageKit (Free, sem cartão)** | Fotos dos produtos | As fotos são **comprimidas no navegador** antes de subir (WebP, até 1600 px, qualidade 0,8) e enviadas direto do navegador para o ImageKit (não passa pela Vercel). A miniatura dos cards (640 px) é gerada pela URL do ImageKit, então cada foto sobe uma vez só. CDN e formato automático (WebP/AVIF) incluídos. |

Uma foto de celular de ~4 MB vira ~150–250 KB, e a miniatura servida nos cards tem ~30–50 KB. O plano grátis do ImageKit (cerca de 20 GB de tráfego e 3 GB de armazenamento por mês; confira os valores atuais no site deles) guarda mais de 10 mil fotos e aguenta perto de 20 mil visitas por mês.

---

## Passo a passo de configuração

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com). Região sugerida: **South America (São Paulo)**.
2. Abra **SQL Editor**, cole o arquivo [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) inteiro e clique em **Run**.
3. Vá em **Authentication → Sign In / Providers** e **desligue "Allow new users to sign up"**: ninguém de fora consegue criar conta.
4. Em **Authentication → Users → Add user**, crie o usuário do lojista (e-mail e senha, marque *Auto confirm*).
5. Volte ao SQL Editor e libere esse usuário como lojista:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'EMAIL_DO_LOJISTA';
   ```
6. Em **Project Settings → API**, copie a **Project URL** e a chave **anon / publishable**.

### 2. ImageKit (fotos)

1. Crie uma conta grátis em [imagekit.io](https://imagekit.io). Não pede cartão.
2. Em **Developer options → API keys**, copie:
   - **Public key** → `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`
   - **Private key** → `IMAGEKIT_PRIVATE_KEY` (fica só no servidor; nunca coloque `NEXT_PUBLIC_` nela)
   - **URL-endpoint** (ex.: `https://ik.imagekit.io/seu_id`) → `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
3. Pronto. Não precisa configurar CORS nem bucket: o painel pede uma assinatura temporária ao servidor e o navegador envia a foto direto para o ImageKit, na pasta `/imperio/produtos/<id-do-produto>`.
4. Quando o lojista remove uma foto ou exclui um produto, o arquivo também é apagado do ImageKit.

### 3. Vercel

1. Suba este projeto no GitHub e importe na [Vercel](https://vercel.com/new).
2. Em **Settings → Environment Variables**, cadastre as variáveis de [`.env.example`](.env.example).
   - `CRON_SECRET` pode ser qualquer texto longo e aleatório.
3. Em **Settings → Domains**, adicione **os dois** domínios no mesmo projeto:
   - `imperiodascapinhas.com.br` (e `www`, redirecionando para ele)
   - `admin.imperiodascapinhas.com.br`
4. O cron em [`vercel.json`](vercel.json) roda 1 vez por dia e mantém o Supabase acordado.

**Antes de ter domínio:** deixe `NEXT_PUBLIC_ADMIN_URL` vazio. O painel funciona em `https://SEU-PROJETO.vercel.app/admin`.

### 4. Rodar no computador

```bash
npm install
cp .env.example .env.local   # e preencha
npm run dev
```

- Loja: http://localhost:3000
- Painel: http://admin.localhost:3000 (ou http://localhost:3000/admin)

Sem as variáveis do Supabase, a loja mostra uma **vitrine de demonstração** com capinhas ilustrativas (`public/demo`, renderizadas por `scripts/make-demo-images.mjs`). Ela some sozinha assim que existir o primeiro produto real.

---

## Como o lojista usa

1. Entra em `admin.imperiodascapinhas.com.br` com e-mail e senha.
2. **Novo produto**: tira as fotos (a primeira é a capa; dá para arrastar e reordenar), escreve o nome, coloca o preço (e o preço "de", se quiser mostrar desconto), cola o **link do anúncio no Mercado Livre**, marca os **modelos compatíveis** e salva.
3. O produto aparece na loja em segundos. Na lista dá para publicar/esconder, destacar (vai para o trilho de ganchos da home), marcar como esgotado e reordenar.
4. **Loja** (configurações): WhatsApp, Instagram, endereço, link do Maps, horário e o aviso que passa no letreiro de LED.
5. **Painel**: cliques em "Comprar no Mercado Livre" e no WhatsApp dos últimos 30 dias, e os produtos mais procurados.

Cada produto ganha um **código curto** (Cód. 101, 102…), que o cliente pode citar no WhatsApp.

---

## Estrutura

```
src/
  app/
    (store)/            loja: home, /produtos, /produto/[slug]
    admin/              painel: login, produtos, categorias, configurações
    admin/actions.ts    server actions (salvar, excluir, assinatura de upload ImageKit, revalidar)
    api/keepalive/      cron diário do Supabase
  components/store/     letreiro, ganchos, plaquinhas, fita de LED, vitrine
  components/admin/     formulário de produto, upload de fotos, listas
  lib/                  catálogo cacheado, ImageKit, compressão de imagem, Supabase
  proxy.ts              protege /admin (só roda lá)
supabase/migrations/    schema + RLS
scripts/                otimização das fotos da marca e imagens de demonstração
```

## Segurança

- RLS em todas as tabelas: visitantes só leem produtos publicados; só usuários da tabela `admins` escrevem.
- Cadastro público desligado no Supabase; a chave `service_role` não é usada em lugar nenhum.
- Upload com assinatura de 15 minutos (uma por foto), gerada só para lojista autenticado. A chave privada do ImageKit nunca vai para o navegador.
- O link de compra só aceita domínios do Mercado Livre (`mercadolivre.com.br`, `mercadolibre.com`, `meli.la`).
