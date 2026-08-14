import type { FastifyInstance } from "fastify";
import { eq, desc } from "drizzle-orm";
import { auth, db } from "../lib/auth.js";
import { contributions, users } from "@firstpr/db";

/**
 * GET /api/me — current user (session-guarded).
 * GET /api/me/prs — this user's detected contributions (phase-03 onward).
 */
export async function meRoutes(app: FastifyInstance) {
  app.get("/api/me", async (request, reply) => {
    const session = await auth.api.getSession({
      headers: request.headers as Record<string, string>,
    });
    if (!session) return reply.code(401).send({ error: "unauthorized" });

    // Custom columns live on our users table, not on the auth session user.
    const profile = await db
      .select({
        githubLogin: users.githubLogin,
        tokenInvalid: users.tokenInvalid,
        tokenUpdatedAt: users.tokenUpdatedAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        githubLogin: profile[0]?.githubLogin ?? null,
        tokenInvalid: profile[0]?.tokenInvalid ?? false,
        tokenUpdatedAt: profile[0]?.tokenUpdatedAt ?? null,
      },
    };
  });

  app.get("/api/me/prs", async (request, reply) => {
    const session = await auth.api.getSession({
      headers: request.headers as Record<string, string>,
    });
    if (!session) return reply.code(401).send({ error: "unauthorized" });

    const rows = await db
      .select()
      .from(contributions)
      .where(eq(contributions.userId, session.user.id))
      .orderBy(desc(contributions.mergedAt));

    return { prs: rows };
  });
}
