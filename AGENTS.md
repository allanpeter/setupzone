<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SetupZone — guia do projeto

Catálogo de afiliados + conteúdo (pt-BR). Stack: Next.js 16 (App Router, RSC),
Prisma 7 (gerador `prisma-client`, saída em `src/generated/prisma`, conexão em
`prisma.config.ts`), Better Auth, Tailwind 4 + shadcn (Base UI).

## Convenções
- Conteúdo e rotas em pt-BR: `/produtos`, `/montagens`, `/comparar`, `/blog`, `/busca`.
- Acesse o banco via `@/lib/db` (singleton). Queries em `src/lib/queries/*`.
- Preços em centavos (Int). Formate com `formatBRL` de `@/lib/format`.
- Design system: tokens em `src/app/globals.css` (`@theme`), prototipos originais
  em `design-reference/`. Use as cores `bg-primary` (verde) / `bg-accent` (dourado)
  e o raio `rounded-sticker`.
- Mutations: Server Actions em `src/app/(admin)/_actions/`, sempre com `requireAdmin()`
  e validação zod. Reveja `revalidatePath` após escrever.
- Links de afiliado: nunca renderize a URL crua — use `/go/<slug>/<loja>`.
- Botões shadcn usam Base UI: para renderizar como link passe `render={<Link/>}`
  (o wrapper já ajusta `nativeButton`).

## Comandos
- `pnpm dev`, `pnpm build`, `pnpm lint`
- `pnpm db:migrate` (dev), `pnpm db:deploy` (prod), `pnpm db:seed`, `pnpm db:studio`
- Admin: `pnpm tsx scripts/create-admin.ts <email> <senha> [nome]`

## Cuidados
- `kysely` está pinado em `pnpm.overrides` (0.28.17) e `better-auth` está em
  `serverExternalPackages` — não remova sem testar `pnpm build`.
- Colunas `searchVector` são GENERATED (migração SQL manual). Não deixe o
  `prisma migrate` recriá-las; edite o SQL gerado se necessário.

## Skill routing
Quando a solicitação casar com uma skill, invoque-a via Skill tool:
- Bugs/erros → /investigate
- QA/testar comportamento → /qa
- Revisão de código/diff → /review ou /code-review
- Polimento visual → /design-review
- Deploy/PR → /ship
