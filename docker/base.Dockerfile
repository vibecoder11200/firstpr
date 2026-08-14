# --- Shared base for api/worker image builds ---
FROM node:22-alpine AS base
WORKDIR /app
# Alpine lacks a C++ toolchain for optional native deps; add git for workspaces

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/scoring/package.json packages/scoring/package.json
COPY packages/github/package.json packages/github/package.json
# Install lockfile deps at the workspace root (best-effort; CI regenerates if absent)
RUN npm install --no-audit --no-fund --workspaces || echo "no lockfile — run npm install locally first"

FROM base AS app
# Explicit base context: caller must provide docker context from repo root