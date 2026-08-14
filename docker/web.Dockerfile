# --- Web (SPA) production image ---
# Context: repo root. Builds the Vite app, serves static files via nginx,
# proxies /api/* to the api service.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/scoring/package.json packages/scoring/package.json
COPY packages/github/package.json packages/github/package.json
RUN npm install --no-audit --no-fund --workspaces
COPY apps/web apps/web
RUN npm run build -w @firstpr/web

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80