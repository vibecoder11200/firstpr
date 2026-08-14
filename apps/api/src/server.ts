import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { env } from "./env.js";
import { issuesRoutes } from "./routes/issues.js";
import { issueDetailRoutes } from "./routes/issue-detail.js";
import { meRoutes } from "./routes/me.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  // CORS must be registered before routes; credentials so auth cookies flow.
  app.register(cors, {
    origin: (origin, cb) => {
      const allowed = [env.publicAppUrl, env.publicApiUrl];
      if (!origin || allowed.includes(origin)) cb(null, true);
      else cb(new Error(`Origin not allowed: ${origin}`), false);
    },
    credentials: true,
  });

  // Public-rate limit: protect list/detail/og endpoints from scrape/abuse (HIGH-4).
  app.register(rateLimit, {
    max: env.isProd ? 30 : 200,
    timeWindow: "1 minute",
    keyGenerator: (req) => req.ip,
  });

  // ---- Better Auth catch-all (confirmed pattern from Better Auth docs) ----
  app.route({
    method: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const headers = fromNodeHeaders(request.headers);
        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });
        const response = await auth.handler(req);

        reply.status(response.status);
        response.headers.forEach((value, key) => reply.header(key, value));
        return reply.send(response.body ? await response.text() : null);
      } catch (error) {
        app.log.error(error, "auth handler error");
        return reply.status(500).send({ error: "Authentication failed" });
      }
    },
  });

  // ---- Health ----
  app.get("/healthz", async () => ({ ok: true }));

  // ---- App routes ----
  app.register(issuesRoutes);
  app.register(issueDetailRoutes);
  app.register(meRoutes);

  return app;
}

if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  const app = buildApp();
  app.listen({ port: env.apiPort, host: "0.0.0.0" }).then(() => {
    app.log.info(`FirstPR API listening on :${env.apiPort}`);
  });
}
