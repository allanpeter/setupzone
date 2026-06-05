# SetupZone

Catálogo de produtos de afiliados e plataforma de conteúdo (pt-BR), focada em
tecnologia: mini PCs, homelab, redes, periféricos, impressão 3D, drones e
gadgets. Gera receita via recomendações com links de afiliados (AliExpress,
Mercado Livre, Shopee, Amazon), montagens curadas, comparativos e conteúdo
otimizado para SEO.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (Base UI)
- **PostgreSQL** + **Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **Better Auth** (e-mail/senha + plugin admin) para o painel
- **Docker** + **Coolify** para deploy

## Começando

Pré-requisitos: Node 20+, pnpm, Docker.

```bash
# 1. Dependências
pnpm install

# 2. Variáveis de ambiente
cp .env.example .env   # já vem com segredos de dev gerados

# 3. Banco de dados local (Postgres na porta 5442)
docker compose up -d postgres

# 4. Migrações + seed
pnpm prisma migrate dev
pnpm db:seed

# 5. Criar um usuário admin
pnpm tsx scripts/create-admin.ts admin@setupzone.dev senha123 "Admin"

# 6. Rodar
pnpm dev   # http://localhost:3000  ·  painel em /admin
```

## Scripts

| Script | Descrição |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` / `pnpm start` | Build de produção / iniciar |
| `pnpm db:migrate` | Criar/aplicar migração (dev) |
| `pnpm db:deploy` | Aplicar migrações (produção) |
| `pnpm db:seed` | Popular dados de exemplo |
| `pnpm db:studio` | Prisma Studio |
| `pnpm lint` | ESLint |

## Estrutura

```
src/
├── app/
│   ├── (public)/        # site público (home, produtos, montagens, comparar, blog, busca)
│   ├── (admin)/         # painel /admin (CRUD + analytics) + _actions (server actions)
│   ├── api/             # auth (Better Auth), health
│   └── go/[productSlug]/[store]/  # redirect de afiliado + tracking
├── components/          # UI compartilhada + components/admin
├── lib/                 # db, auth, queries/, search, tracking, jsonld, format
├── generated/prisma/    # cliente Prisma (gerado, gitignored)
└── proxy.ts             # guarda otimista do /admin
prisma/                  # schema, migrations, seed
```

Veja [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes e roadmap.

## Deploy (Coolify)

1. Provisione um PostgreSQL gerenciado e configure `DATABASE_URL`.
2. Configure as variáveis do `.env.example` (gere `BETTER_AUTH_SECRET` e
   `IP_HASH_SALT` com `openssl rand -base64 32`).
3. Build via `Dockerfile` (saída standalone).
4. Comando de release: `node_modules/.bin/prisma migrate deploy`.
5. Healthcheck: `GET /api/health`.

> Divulgação: como afiliado, podemos receber comissões por compras qualificadas.
