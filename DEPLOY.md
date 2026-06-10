# Deploy — Coolify + Cloudflare R2

Produção: `https://setupzone.com.br` · build via `Dockerfile` (Next standalone).

## 1. Banco de dados (PostgreSQL)
Crie um Postgres gerenciado no Coolify (ou um serviço Postgres no projeto) e
copie a connection string para `DATABASE_URL`.

## 2. Variáveis de ambiente (no Coolify)
```bash
DATABASE_URL=postgresql://USER:PASS@HOST:5432/setupzone
BETTER_AUTH_SECRET=          # openssl rand -base64 32
BETTER_AUTH_URL=https://setupzone.com.br
TRUSTED_ORIGINS=https://setupzone.com.br
IP_HASH_SALT=                # openssl rand -base64 24
NEXT_PUBLIC_SITE_URL=https://setupzone.com.br
NEXT_PUBLIC_SITE_NAME=SetupZone

# Cloudflare R2 (imagens próprias)
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=setupzone-media
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_PUBLIC_URL=https://cdn.setupzone.com.br   # domínio público do bucket

# Opcional
REDIS_URL=
```

## 3. App no Coolify
- Source: repositório GitHub `allanpeter/setupzone`, branch `main`.
- Build pack: **Dockerfile** (já existe na raiz).
- Porta exposta: **3000**.
- Healthcheck: `GET /api/health`.
- **Comando de release / pré-deploy** (roda as migrações antes de subir):
  ```bash
  node_modules/.bin/prisma migrate deploy
  ```
- Domínio: aponte `setupzone.com.br` no Coolify e crie o DNS (A/CNAME) apontando
  para o servidor. SSL automático (Let's Encrypt) pelo Coolify.

## 4. Primeiro deploy
1. Faça o deploy (Coolify builda a imagem e sobe).
2. Crie o usuário admin uma vez (terminal do container ou job):
   ```bash
   pnpm tsx scripts/create-admin.ts voce@email.com "senha-forte" "Seu Nome"
   ```
3. (Opcional) rode `pnpm db:seed` se quiser dados de exemplo — **NÃO** rode em
   prod se já for cadastrar conteúdo real.

## 5. Cloudflare R2 (imagens)
1. Crie o bucket `setupzone-media` no R2.
2. Gere um **API Token** (Access Key + Secret) com permissão de leitura/escrita.
3. Conecte um **domínio público** ao bucket (ex.: `cdn.setupzone.com.br`) ou use
   a URL `*.r2.dev`.
4. Garanta que o host público esteja em `next.config.ts → images.remotePatterns`
   (já inclui `*.r2.dev`; **adicione `cdn.setupzone.com.br`** se usar domínio
   próprio).

> Imagens dos marketplaces (AliExpress/ML/Shopee/Amazon) são referenciadas pelas
> URLs dos CDNs deles (já liberados em `remotePatterns`). O upload pro R2 é só
> para imagens próprias (capas de blog/montagem). A UI de upload é item do
> roadmap Growth — hoje o admin aceita imagem por URL.

## 6. Otimização de imagem (atenção)
O `next/image` usa `sharp` para otimizar. Confirme no primeiro deploy que as
imagens carregam sem erro no container. Se der problema com `sharp` no Alpine,
duas saídas: (a) habilitar o build do `sharp` na imagem, ou (b) deixar o
Cloudflare redimensionar e usar `images: { unoptimized: true }`.

## Fluxo de alterações (iterar em prod)
Mantenha o fluxo de PR que já existe: branch a partir da `main`
(`feature/...` ou `fix/...`) → PR → merge na `main` → Coolify faz auto-deploy.
Evite commitar direto na `main` para manter o histórico e poder reverter.
