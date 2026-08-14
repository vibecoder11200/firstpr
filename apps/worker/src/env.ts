import "dotenv/config";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name} (see .env.example)`);
  return v;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  redisUrl: required("REDIS_URL"),
  githubAppId: optional("GITHUB_APP_ID"),
  githubAppPrivateKey: optional("GITHUB_APP_PRIVATE_KEY"),
  githubToken: optional("GITHUB_TOKEN"), // dev PAT fallback
  scoreMaxAgeHours: Number(optional("SCORE_MAX_AGE_HOURS", "24")),
  // How far back to crawl for discovery (days). Search API date-range split.
  discoverDays: Number(optional("DISCOVER_DAYS", "90")),
};