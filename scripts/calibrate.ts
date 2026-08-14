import { createRequire } from "node:module";
import * as readline from "node:readline/promises";

// =====================================================================
// FirstPR — scoring calibration tool (phase-02, gate G1)
//
// Pulls N open "good first issue"-style issues from the Postgres cache,
// shows each one, and asks a human to grade it 0–100. Compares against
// the model score (raw + displayed/confidence-adjusted), tracks the
// mismatch, and prints an agreement rate.
//
//   G1 pass: agreement ≥ 80% (within ±10 points is "agreement").
//
// Usage (from repo root):
//   node --import tsx scripts/calibrate.ts --count 20 --db postgres://...:5432/firstpr
//
// Not part of the app runtime — developer tool only.
// =====================================================================

const require = createRequire(import.meta.url);
const { eq } = require("drizzle-orm") as typeof import("drizzle-orm");
const { createDb, closeDb, repos, issues, scores, repoMetrics } = require("@firstpr/db") as typeof import("@firstpr/db");
const { computeScore, DEFAULT_CONFIG } = require("@firstpr/scoring") as typeof import("@firstpr/scoring");

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const count = Number(arg("--count") ?? "20");
const dbUrl =
  arg("--db") ??
  process.env.CALIBRATE_DB_URL ??
  "postgres://firstpr:firstpr@localhost:5432/firstpr";

const TOLERANCE = 10; // ±10 model points counts as agreement

interface Graded {
  issueId: number;
  title: string;
  repoFullName: string;
  human: number;
  raw: number;
  displayed: number;
  confidence: string;
  agreeRaw: boolean;
  agreeDisplayed: boolean;
}

async function grade(): Promise<Graded[]> {
  const db = createDb(dbUrl);
  const rows = await db
    .select({
      issue: issues,
      repo: repos,
      score: scores,
      metrics: repoMetrics,
    })
    .from(issues)
    .innerJoin(repos, eq(issues.repoId, repos.id))
    .leftJoin(scores, eq(issues.scoreId, scores.id))
    .leftJoin(repoMetrics, eq(repos.repoMetricsId, repoMetrics.id))
    .where(eq(issues.state, "open"))
    .limit(count);

  const graded: Graded[] = [];
  for (const { issue, repo, score, metrics } of rows) {
    const confidence = score?.confidence ?? "low";
    const raw = score?.total ?? 0;
    // persisted displayed score (computed from unrounded raw at score time)
    const displayed = score?.displayedScore ?? 0;

    console.log("\n" + "-".repeat(72));
    console.log(`#${graded.length + 1}  ${repo.fullName} · ${issue.title}`);
    console.log(`   language=${issue.language}  stars=${repo.stargazersCount}  age=${Math.round((Date.now() - issue.createdAt.getTime()) / 86_400_000)}d`);
    console.log(`   labels=${issue.labels?.join(", ") ?? "—"}`);
    console.log(`   confidence=${confidence}  model.score=${raw}  displayed=${displayed}`);
    console.log(`   --- issue body ---\n${(issue.body ?? "").slice(0, 400)}${(issue.body?.length ?? 0) > 400 ? "…" : ""}`);

    const human = await askScore();
    graded.push({
      issueId: issue.id,
      title: issue.title,
      repoFullName: repo.fullName,
      human,
      raw,
      displayed,
      confidence,
      agreeRaw: Math.abs(human - raw) <= TOLERANCE,
      agreeDisplayed: Math.abs(human - displayed) <= TOLERANCE,
    });
    console.log(`   → human=${human}  |${Math.abs(human - raw) <= TOLERANCE ? "match" : "diff"} raw vs model`);
  }

  return graded;
}

// Hybrid input: interactive TTY prompts per issue; piped stdin (CI/smoke)
// is drained up front into a list so a closed pipe can't kill the run.
const isTTY = process.stdin.isTTY === true;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: isTTY,
});

let pipedLines: string[] | null = null;
if (!isTTY) {
  pipedLines = [];
  for await (const line of rl) pipedLines.push(line);
}

async function askScore(): Promise<number> {
  for (;;) {
    const answer = pipedLines
      ? (pipedLines.shift() ?? "")
      : await rl.question("\n   your score (0-100)? ");
    const n = Number(answer.trim());
    if (Number.isFinite(n) && n >= 0 && n <= 100) return Math.round(n);
    if (!pipedLines) console.log("   (enter a number 0-100)");
    else if (pipedLines.length === 0)
      throw new Error("input exhausted — supply one score per issue (0-100) on stdin");
  }
}

async function main() {
  const graded = await grade();

  if (graded.length === 0) {
    console.log("no issues to calibrate — the crawler/DB cache is empty. Run the crawler first.");
    return;
  }

  const agreeRaw = graded.filter((g) => g.agreeRaw).length;
  const agreeDisplayed = graded.filter((g) => g.agreeDisplayed).length;
  const rawRate = (agreeRaw / graded.length) * 100;
  const displayedRate = (agreeDisplayed / graded.length) * 100;

  console.log("\n" + "=".repeat(72));
  console.log(`Calibration result — ${graded.length} issues`);
  console.log(`  agreement raw score (±${TOLERANCE}):      ${agreeRaw}/${graded.length} = ${rawRate.toFixed(0)}%`);
  console.log(`  agreement displayed (±${TOLERANCE}):      ${agreeDisplayed}/${graded.length} = ${displayedRate.toFixed(0)}%`);
  console.log(`  G1 requires raw agreement ≥ 80% → ${rawRate >= 80 ? "PASS" : "FAIL"}`);
  console.log("=".repeat(72));
  console.log("\nDiffs (human vs raw model) — greatest first, to spot threshold/weight bias:");
  console.table(
    [...graded]
      .sort((a, b) => Math.abs(b.human - b.raw) - Math.abs(a.human - a.raw))
      .map((g) => ({
        id: g.issueId,
        repo: g.repoFullName,
        confidence: g.confidence,
        human: g.human,
        raw: g.raw,
        displayed: g.displayed,
        diff: g.human - g.raw,
      })),
  );
}

async function run() {
  try {
    await main();
  } finally {
    await closeDb();
    rl.close();
  }
}

run()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });