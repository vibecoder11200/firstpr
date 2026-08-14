export interface ApiIssue {
  id: number;
  title: string;
  repoFullName: string;
  repoUrl: string;
  htmlUrl: string;
  language: string;
  stars: number;
  createdAt: string;
  score: number;
  scoreBreakdown: {
    maintainer: number | null;
    repoHealth: number | null;
    freshness: number | null;
    clarity: number | null;
  };
  confidence: string;
}

export interface IssueListResponse {
  issues: ApiIssue[];
  page: number;
  pageSize: number;
  total: number;
}

const API = "/api";

/** Fetch a page of issues. */
export async function fetchIssues(params: {
  language?: string;
  sort?: "score" | "fresh";
  page?: number;
  pageSize?: number;
}): Promise<IssueListResponse> {
  const q = new URLSearchParams();
  if (params.language && params.language !== "all") q.set("language", params.language);
  if (params.sort) q.set("sort", params.sort);
  if (params.page) q.set("page", String(params.page));
  if (params.pageSize) q.set("pageSize", String(params.pageSize));
  const res = await fetch(`${API}/issues?${q}`);
  if (!res.ok) throw new Error(`fetch /api/issues failed: ${res.status}`);
  return res.json() as Promise<IssueListResponse>;
}

export async function fetchLanguages(): Promise<string[]> {
  const res = await fetch(`${API}/issues/languages`);
  if (!res.ok) return [];
  return res.json() as Promise<string[]>;
}

export function authUrl(): string {
  return `${API}/auth/sign-in/social?provider=github&callbackURL=${encodeURIComponent(
    window.location.origin,
  )}`;
}

export async function fetchMe() {
  const res = await fetch(`${API}/me`, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json();
}