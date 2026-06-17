#!/bin/sh
# Aplica as migrations e sobe o servidor Next.js. Roda no container NOVO a cada
# start — não depende do "Pre-deployment Command" do Coolify (que executa no
# container ANTIGO, sem o dir /migrate). A toolchain do prisma vive isolada em
# /migrate (ver Dockerfile). Falha-rápido: se a migration falhar, o container não
# sobe (Coolify mantém a versão anterior no ar).
set -e

echo "→ prisma migrate deploy (de /migrate)..."
cd /migrate && node_modules/.bin/prisma migrate deploy

echo "→ iniciando Next.js..."
cd /app
exec node server.js
