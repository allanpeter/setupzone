# syntax=docker/dockerfile:1

# ─── Base ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# ─── Dependencies ──────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ─── Build ─────────────────────────────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate the Prisma client (rust-free, no engine binary) then build.
RUN pnpm prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ─── Migrator ──────────────────────────────────────────────────────────────
# Self-contained Prisma CLI for `migrate deploy` inside the deployed container.
# pnpm installs node_modules as symlinks into a virtual store (.pnpm), so
# cherry-picking `node_modules/prisma` into the runner yields dangling symlinks
# ("Cannot find module '@prisma/engines'"). Instead we build a flat, npm-based
# toolchain with just what prisma.config.ts needs (prisma + dotenv). Versions
# track package.json so this stays in sync.
FROM base AS migrator
WORKDIR /migrator
COPY package.json ./pkg.json
RUN npm init -y >/dev/null 2>&1 && \
    npm install \
      "prisma@$(node -p "require('./pkg.json').devDependencies.prisma")" \
      "dotenv@$(node -p "require('./pkg.json').devDependencies.dotenv")" && \
    rm pkg.json

# ─── Runner ────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Next.js standalone output. Brings its own traced node_modules into /app — which
# is exactly why the Prisma CLI must NOT live here: copying the standalone on top
# of a /app/node_modules/prisma shadows @prisma/engines and breaks `migrate deploy`.
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma migrator toolchain in an ISOLATED dir, untouched by the standalone copy.
# Coolify "Pre-deployment Command":
#   cd /migrate && node_modules/.bin/prisma migrate deploy
# prisma.config.ts resolves prisma/{schema,migrations} relative to CWD (/migrate).
COPY --from=migrator --chown=nextjs:nodejs /migrator/node_modules /migrate/node_modules
COPY --from=build --chown=nextjs:nodejs /app/prisma /migrate/prisma
COPY --from=build --chown=nextjs:nodejs /app/prisma.config.ts /migrate/prisma.config.ts

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
