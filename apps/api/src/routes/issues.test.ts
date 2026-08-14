import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { buildApp } from "../server.js";
import { createDb, repos, issues, scores } from "@firstpr/db";

const TEST_DB = "postgres://firstpr:firstpr@localhost:5432/firstpr";

// Integration test against the real Postgres (uses a scratch repo/issue).
let app: ReturnType<typeof buildApp>;

beforeAll(async () => {
  app = buildApp();
  await app.ready();
  const db = createDb(TEST_DB);
  // seed scratch row
  await db.insert(repos).values({
    id: 900001, owner: "scratch", name: "repo", fullName: "scratch/repo",
    language: "typescript", stargazersCount: 10, archived: false, fork: false,
  }).onConflictDoNothing();
  await db.insert(issues).values({
    id: 900001, repoId: 900001, number: 1, title: "Scratch issue for tests",
    body: "A sufficiently detailed body for the test issue.",
    language: "typescript", state: "open", isGoodFirstIssue: true,
    labels: ["good first issue"], htmlUrl: "https://github.com/scratch/repo/issues/1",
    createdAt: new Date(), updatedAt: new Date(), stale: true,
  }).onConflictDoNothing();
  const s = await db.insert(scores).values({
    issueId: 900001, total: 77, scoreMaintainer: 70, scoreRepoHealth: 80,
    scoreIssueFreshness: 90, scoreIssueClarity: 70, confidence: "medium",
  }).returning({ id: scores.id }).onConflictDoNothing();
  if (s[0]) await db.update(issues).set({ scoreId: s[0]!.id, stale: false }).where(eq(issues.id, 900001));
});

afterAll(async () => {
  await app.close();
});

describe("GET /api/issues", () => {
  it("returns issues sorted by score", async () => {
    const res = await app.inject({ method: "GET", url: "/api/issues?pageSize=10" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(Array.isArray(body.issues)).toBe(true);
    expect(body.total).toBeGreaterThan(0);
  });

  it("filters by language", async () => {
    const res = await app.inject({ method: "GET", url: "/api/issues?language=python" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.issues.every((i: any) => i.language === "python")).toBe(true);
  });
});

describe("GET /api/issues/:id", () => {
  it("returns 404 for missing issue", async () => {
    const res = await app.inject({ method: "GET", url: "/api/issues/999999" });
    expect(res.statusCode).toBe(404);
  });
});
