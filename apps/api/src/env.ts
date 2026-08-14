import "dotenv/config";

/** Typed env access with clear failures when required vars are missing. */
function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name} (see .env.example)`);
  return v;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  isProd: process.env.NODE_ENV === "production",
  apiPort: Number(optional("API_PORT", "4000")),
  webPort: Number(optional("WEB_PORT", "3000")),
  publicApiUrl: optional("PUBLIC_API_URL", "http://localhost:4000"),
  publicAppUrl: optional("PUBLIC_APP_URL", "http://localhost:3000"),
  databaseUrl: required("DATABASE_URL"),
  redisUrl: optional("REDIS_URL", "redis://localhost:6379"),
  betterAuthSecret: required("BETTER_AUTH_SECRET"),
  githubClientId: optional("GITHUB_CLIENT_ID"),
  githubClientSecret: optional("GITHUB_CLIENT_SECRET"),
  posthogKey: optional("POSTHOG_KEY"),
  posthogHost: optional("POSTHOG_HOST", "https://us.i.posthog.com"),
  scoreMaxAgeHours: Number(optional("SCORE_MAX_AGE_HOURS", "24")),
};