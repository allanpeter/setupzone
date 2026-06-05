# SetupZone — Arquitetura

## Visão geral

```
Navegador ──▶ Next.js 16 (App Router, RSC) ──▶ Prisma 7 (pg adapter) ──▶ PostgreSQL
                     │
                     ├─ Better Auth (e-mail/senha, plugin admin) ── /api/auth/[...all]
                     ├─ /go/<produto>/<loja>  → grava clique + 302 p/ afiliado
                     └─ Full-text search (tsvector PT) p/ /busca
```

Renderização: páginas públicas são Server Components com `revalidate`/cache.
Painel é dinâmico (sessão). Mutations usam **Server Actions** em
`src/app/(admin)/_actions/` com validação **zod** e `requireAdmin()`.

## Modelo de dados (Prisma)

Catálogo: `Product` (specs JSON, `lowestPriceCents` denormalizado), `Category`
(auto-relação p/ subcategorias), `Brand`, `Store`, `AffiliateLink` (produto×loja),
`ProductPrice` (histórico, `isCurrent`), `MediaAsset`.

Conteúdo: `Build` + `BuildItem`; `Comparison` + `ComparisonItem`; `BlogPost`,
`BlogCategory`, `BlogTag` (+ join `BlogPostTags`).

Tracking/SEO/Auth: `AffiliateClick` (ipHash), `SeoMetadata` (polimórfico),
`User`/`Session`/`Account`/`Verification` (Better Auth, `role` string),
`AppSetting` (KV, ex.: câmbio USD/BRL).

`Product`/`Build`/`BlogPost` têm coluna gerada `searchVector tsvector` (config
`portuguese`) com índice GIN — criada via migração SQL em
`prisma/migrations/*_fulltext_search`.

## Tracking de afiliados

`/go/<produtoSlug>/<lojaSlug>` (route handler) procura o `AffiliateLink`, grava
um `AffiliateClick` com IP hasheado (`sha256(salt:ip)` em `src/lib/tracking.ts`),
captura referrer/UA e faz `302` para a URL de destino (aplicando o template da
loja, se houver). URLs cruas de afiliado nunca aparecem no HTML.

## Busca

`src/lib/search.ts` roda `websearch_to_tsquery('portuguese', …)` nas três tabelas
e mescla por `ts_rank`. A interface é estreita de propósito para permitir trocar
por Meilisearch depois sem mexer nas páginas.

## SEO

`app/sitemap.ts` e `app/robots.ts` dinâmicos; `generateMetadata` por página;
helpers de JSON-LD em `src/lib/jsonld.ts` (Product, Article, BreadcrumbList,
ItemList) injetados via `<JsonLd>`.

## Decisões e ressalvas

- **Prisma 7** usa o gerador `prisma-client` (sem Rust) com saída em
  `src/generated/prisma`; conexão configurada em `prisma.config.ts`.
- **Better Auth** é mantido em `serverExternalPackages` e `kysely` foi pinado
  (`pnpm.overrides`) para `0.28.17` por incompatibilidade do adapter opcional.
- Editor de blog usa textarea HTML (conteúdo confiável, renderizado com
  `dangerouslySetInnerHTML`). Trocar por um editor rico (Tiptap) é um upgrade
  natural — sanitizar a saída se for permitir autores não confiáveis.
- Preço guardado em centavos (`Int`) para evitar problemas de ponto flutuante.

## Roadmap

**Curto prazo**
- Editor rich-text (Tiptap) + upload S3 real (infra de `@aws-sdk/client-s3` pronta).
- Importar o crawler do projeto `meusetup` (AliExpress, câmbio USD/BRL) como job
  agendado p/ atualizar `ProductPrice`/disponibilidade.
- Gráfico de histórico de preços na página do produto.

**Produção / escala**
- Cache com Redis para listagens e agregações de analytics.
- Migrar busca para Meilisearch quando o volume crescer.
- CDN/edge para imagens; tighten `images.remotePatterns`.
- Rate limit no `/go` e detecção de cliques fraudulentos.
- Testes E2E (Playwright) cobrindo o fluxo de compra e o painel.
