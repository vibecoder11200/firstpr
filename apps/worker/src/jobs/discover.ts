import { eq } from "drizzle-orm";
import { createDb, repos, issues } from "@firstpr/db";
import { GitHubClient, stripHtml, toSearchText, isBotOwner } from "@firstpr/github";
import { env } from "../env.js";
import { enqueueRepoMetrics, enqueueScoreCompute, type CrawlJobData } from "../queue.js";

const db = createDb(env.databaseUrl);

/**
 * Discover job — Search API `label:"good first issue" language:...`
 * with a date-range split so we stay under the 1,000 results/query cap
 * (HIGH-11). Sanitizes all GitHub-derived strings, upserts into Postgres,
 * and enqueues repo-metrics jobs for repos with no metrics yet (CRIT-2).
 *
 * NOTE: `search/issues` result items do NOT include a `repository` object
 * (only `repository_url`), so we resolve each repo via `GET /repos/{o}/{r}`
 * to get its real id + metadata. Results are cached per-run.
 */
export async function discoverJob(data: CrawlJobData): Promise<void> {
  const token = env.githubToken;
  if (!token) {
    console.warn("discover: no GITHUB_TOKEN set — skipping crawl. Set it for real crawling.");
    return;
  }

  const client = new GitHubClient({ token });
  const languages = data.languages ?? ["python", "typescript", "javascript"];
  const from = data.from ?? new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
  const to = data.to ?? new Date().toISOString().slice(0, 10);

  const repoCache = new Map<string, ResolvedRepo>();
  const reposToEnqueue = new Set<number>();
  let totalFound = 0;

  for (const lang of languages) {
    for (let page = 1; page <= 10; page++) {
      const q = `label:"good first issue" language:${lang} created:${from}..${to}`;
      const res = await client.searchIssues(q, { perPage: 100, page, job: "discover" });

      for (const item of res.data.items) {
        const handled = await upsertIssue(client, item, repoCache);
        if (handled?.repoId) reposToEnqueue.add(handled.repoId);
      }
      totalFound += res.data.items.length;

      const total = res.data.total_count ?? 0;
      if (res.data.items.length === 0 || page * 100 >= total) break;
    }
  }

  // Enqueue repo-metrics for every repo we met this run (idempotent by jobId).
  for (const repoId of reposToEnqueue) {
    await enqueueRepoMetrics(repoId);
  }

  // Enqueue one full score-compute sweep — stale issues will be re-scored.
  await enqueueScoreCompute();

  console.log(`discover done: ${totalFound} issues, ${reposToEnqueue.size} repos queued for ${from}..${to}`);
}

interface ResolvedRepo {
  id: number;
  needMetrics: boolean;
  language: string;
  stargazersCount: number;
  isBotOwned: boolean;
}

async function upsertIssue(
  client: GitHubClient,
  item: any,
  repoCache: Map<string, ResolvedRepo>,
): Promise<{ repoId: number | null } | null> {
  // Anti-gaming: skip records that are actually pull requests (HIGH-11).
  if (item.pull_request?.url) return null;

  const repoFullName: string = item.repository_url?.replace("https://api.github.com/repos/", "") ?? "";
  const [owner, name] = repoFullName.split("/");
  if (!owner || !name) return null;

  const sanitizedTitle = stripHtml(item.title);
  // search/issues returns body_html/body as optional; prefer body_text/body for raw text
  const sanitizedBody = stripHtml(item.body_text ?? item.body ?? item.body_html);
  if (!sanitizedTitle || !sanitizedBody) return null; // empty body → hard filter

  // Resolve the real repo (id + metadata). Cache per-run to avoid N× repo calls.
  let cached = repoCache.get(repoFullName);
  if (!cached) {
    const resolved = await resolveRepo(client, owner, name);
    if (!resolved) return null;
    cached = resolved;
    repoCache.set(repoFullName, resolved);
  }
  const { id: repoId, needMetrics, language, stargazersCount } = cached;

  const labels: string[] = (item.labels ?? []).map((l: any) => stripHtml(l.name)).filter(Boolean);
  const isGfi = labels.some((l: string) => l.toLowerCase().includes("good first issue"));

  await db
    .insert(issues)
    .values({
      id: item.id,
      repoId,
      number: item.number,
      title: sanitizedTitle,
      body: sanitizedBody,
      searchText: toSearchText(`${sanitizedTitle} ${sanitizedBody}`),
      state: item.state,
      pullRequestId: null,
      htmlUrl: item.html_url,
      userLogin: item.user?.login ?? null,
      isGoodFirstIssue: isGfi,
      labels,
      language,
      stargazersCount,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
      closedAt: item.closed_at ? new Date(item.closed_at) : null,
      stale: true, // starts stale → score-compute sets false (CRIT-2)
    })
    .onConflictDoUpdate({
      target: [issues.repoId, issues.number],
      set: {
        title: sanitizedTitle,
        body: sanitizedBody,
        searchText: toSearchText(`${sanitizedTitle} ${sanitizedBody}`),
        state: item.state,
        updatedAt: new Date(item.updated_at),
        closedAt: item.closed_at ? new Date(item.closed_at) : null,
        stale: true,
      },
    });

  return { repoId: needMetrics ? repoId : null };
}

/**
 * Resolve a repo via `GET /repos/{owner}/{name}` to get its real id and
 * metadata (the search endpoint doesn't return a `repository` object).
 * Returns null if the repo can't be fetched or is invalid.
 */
async function resolveRepo(
  client: GitHubClient,
  owner: string,
  name: string,
): Promise<ResolvedRepo | null> {
  let repo: Awaited<ReturnType<GitHubClient["getRepo"]>>["data"];
  try {
    const res = await client.getRepo(owner, name);
    repo = res.data;
  } catch (err) {
    console.warn(`resolveRepo ${owner}/${name} error: ${(err as Error).message}`);
    return null;
  }
  if (!repo?.id) return null;

  const repoId = repo.id;
  const fullName = repo.full_name ?? `${owner}/${name}`;

  // Upsert repo row (cheap; metrics job enriches later)
  const needMetrics = await upsertRepoRow(repoId, fullName, repo);
  return {
    id: repoId,
    needMetrics,
    language: (repo.language ?? "other").toLowerCase(),
    stargazersCount: repo.stargazers_count ?? 0,
    isBotOwned: isBotOwner(repo.owner),
  };
}

async function upsertRepoRow(
  repoId: number,
  fullName: string,
  repo: any,
): Promise<boolean> {
  const [owner, name] = fullName.split("/");
  if (!owner || !name) return false;
  const isBotOwned = isBotOwner(repo.owner);
  await db
    .insert(repos)
    .values({
      id: repoId,
      owner,
      name,
      fullName,
      description: stripHtml(repo.description),
      stargazersCount: repo.stargazers_count ?? 0,
      language: repo.language ?? "other",
      archived: repo.archived ?? false,
      isBotOwned,
      pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      fork: repo.fork ?? false,
      lastCrawledAt: new Date(),
    })
    .onConflictDoUpdate({
      target: repos.fullName,
      set: {
        description: stripHtml(repo.description),
        stargazersCount: repo.stargazers_count ?? 0,
        language: repo.language ?? "other",
        archived: repo.archived ?? false,
        isBotOwned,
        pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
        lastCrawledAt: new Date(),
      },
    });

  // After upsert, check if this repo already has metrics.
  const existing = await db
    .select({ repoMetricsId: repos.repoMetricsId })
    .from(repos)
    .where(eq(repos.fullName, fullName))
    .limit(1);
  return existing[0]?.repoMetricsId == null;
}
