# --- Worker production image ---
# Context: repo root. Runs bullMQ workers + schedulers.
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
COPY apps/worker apps/worker
COPY packages packages
# Build the worker entry; shared packages stay as TS source and are run via tsx.
RUN npm run build -w @firstpr/worker

# Compile the worker entry, but run via tsx so the workspace TS packages
# (@firstpr/db src/index.ts etc) resolve without a NodeNext import dance.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/package-lock.json* ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/worker/dist apps/worker/dist
COPY --from=build /app/apps/worker/package.json apps/worker/package.json
COPY --from=build /app/packages/db packages/db
COPY --from=build /app/packages/scoring packages/scoring
COPY --from=build /app/packages/github packages/github
CMD ["node", "--import", "tsx", "apps/worker/dist/index.js"]