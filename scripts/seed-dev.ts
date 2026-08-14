import { eq } from "drizzle-orm";
import { createDb, repos, issues, scores } from "@firstpr/db";

// Seeder for local dev/visual verification. NOT part of the app runtime.
const db = createDb("postgres://firstpr:firstpr@localhost:5432/firstpr");

async function seed() {
  // Clean slate — dev-only, safe to drop rows in this order.
  await db.delete(scores);
  await db.delete(issues);
  await db.delete(repos);

  await db.insert(repos).values([
    { id: 1, owner: "facebook", name: "react", fullName: "facebook/react", language: "typescript", stargazersCount: 220000, pushedAt: new Date(), archived: false, fork: false },
    { id: 2, owner: "vercel", name: "next.js", fullName: "vercel/next.js", language: "typescript", stargazersCount: 120000, pushedAt: new Date(), archived: false, fork: false },
    { id: 3, owner: "python", name: "cpython", fullName: "python/cpython", language: "python", stargazersCount: 58000, pushedAt: new Date(), archived: false, fork: false },
  ]).onConflictDoNothing();

  await db.insert(issues).values([
    { id: 101, repoId: 1, number: 28000, title: "Add a focus-within variant to the new compiler", body: "Detailed repro: the focus-within pseudo-class is missing in the CSS preview. Steps to reproduce and expected output included with screenshots and a failing test case.", language: "typescript", state: "open", isGoodFirstIssue: true, labels: ["good first issue"], htmlUrl: "https://github.com/facebook/react/issues/28000", createdAt: new Date(Date.now() - 5 * 864e5), updatedAt: new Date(), stale: true },
    { id: 102, repoId: 2, number: 58000, title: "Update hydration error message to include a code frame", body: "The hydration mismatch error is hard to debug. This change adds a code frame pointing at the offending node. Includes unit tests and a fixture.", language: "typescript", state: "open", isGoodFirstIssue: true, labels: ["good first issue"], htmlUrl: "https://github.com/vercel/next.js/issues/58000", createdAt: new Date(Date.now() - 2 * 864e5), updatedAt: new Date(), stale: true },
    { id: 103, repoId: 3, number: 99000, title: "Document the new asyncio API surface in docs/whatsnew", body: "The 3.13 whatsnew document is missing the asyncio task group additions. Write the section with examples, reference the PEP, and link the existing tests.", language: "python", state: "open", isGoodFirstIssue: true, labels: ["good first issue"], htmlUrl: "https://github.com/python/cpython/issues/99000", createdAt: new Date(Date.now() - 10 * 864e5), updatedAt: new Date(), stale: true },
  ]).onConflictDoNothing();

  const s1 = await db.insert(scores).values([
    { issueId: 101, total: 82, displayedScore: 82, scoreMaintainer: 78, scoreRepoHealth: 90, scoreIssueFreshness: 85, scoreIssueClarity: 92, confidence: "high", recomputedAt: new Date(), computedAt: new Date() },
    { issueId: 102, total: 74, displayedScore: 74, scoreMaintainer: 70, scoreRepoHealth: 85, scoreIssueFreshness: 90, scoreIssueClarity: 70, confidence: "high", recomputedAt: new Date(), computedAt: new Date() },
    { issueId: 103, total: 88, displayedScore: 88, scoreMaintainer: 90, scoreRepoHealth: 80, scoreIssueFreshness: 88, scoreIssueClarity: 95, confidence: "high", recomputedAt: new Date(), computedAt: new Date() },
  ]).returning({ id: scores.id, issueId: scores.issueId }).onConflictDoNothing();

  for (const s of s1) {
    await db.update(issues).set({ scoreId: s.id, stale: false }).where(eq(issues.id, s.issueId));
  }

  console.log("seeded ok");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});