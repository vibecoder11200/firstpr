import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb, type DB } from "@firstpr/db";
import { env } from "../env.js";

// Single DB instance for the whole API process.
export const db: DB = createDb(env.databaseUrl);

/**
 * Better Auth instance (CRIT-1 / Q1-Q2).
 *
 * Security decisions locked in:
 *   - GitHub scopes: `read:user` + `user:email` (+ `public_repo` for
 *     portfolio reads). Deliberately NOT `repo` — smaller leak blast radius.
 *   - `account.encryptOAuthTokens: true` — access + refresh tokens encrypted
 *     at rest (C6).
 *   - Session 7 days, updateAge 1 day (refresh extends expiry), secure cookies
 *     in production.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: env.betterAuthSecret,
  trustedOrigins: [env.publicAppUrl, env.publicApiUrl],
  baseURL: env.publicApiUrl,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // extend once per day
  },
  account: {
    encryptOAuthTokens: true,
  },
  advanced: {
    useSecureCookies: env.isProd,
    cookiePrefix: "firstpr",
  },
  socialProviders: {
    github: {
      clientId: env.githubClientId,
      clientSecret: env.githubClientSecret,
      // NOTE: sync scopes here if you touch them; must stay read-only (Q1).
      scopes: ["read:user", "user:email", "public_repo"],
    },
  },
});