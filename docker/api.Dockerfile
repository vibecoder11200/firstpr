# --- API production image ---
# Context: repo root. Builds apps/api and its workspace deps.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/scoring/package.json packages/scoring/package.json
COPY packages/github/package.json packages/github/package.json
RUN npm install --no-audit --no-fund --workspaces
COPY apps/api apps/api
COPY packages packages
RUN npm run build -w @firstpr/api

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json* ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/package.json apps/api/package.json
COPY --from=build /app/packages/db packages/db
COPY --from=build /app/packages/scoring packages/scoring
COPY --from=build /app/packages/github packages/github
EXPOSE 4000
CMD ["node", "--import", "tsx", "apps/api/dist/server.js"]