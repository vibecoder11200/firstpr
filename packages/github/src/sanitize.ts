/* =====================================================================
 * FirstPR — sanitization helpers (HIGH-11)
 *
 * Every GitHub-derived string (issue/PR title, body, repo description,
 * user login) is sanitized to plaintext before it hits Postgres, and again
 * before any render. The frontend additionally renders via text nodes only
 * (no dangerouslySetInnerHTML) — this module is the backstop.
 * ===================================================================== */

/** Strip HTML tags, normalize entities, collapse whitespace, keep VN diacritics. */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lowercase token stream for offline search (no secrets, no HTML). */
export function toSearchText(input: string | null | undefined): string {
  if (!input) return "";
  return stripHtml(input).toLowerCase();
}

/** Validate a GitHub username (owner) is a safe, simple slug. */
export function isValidGitHubLogin(login: string): boolean {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(login);
}

/**
 * True when the repo owner is a GitHub Bot account (anti-gaming: bot-owned
 * repos mass-mine `good first issue` labels). GitHub reports most bots with
 * `type: "Bot"`, but some (dependabot, renovate, github-actions) surface as
 * ordinary users; the conventional bot marker is the `[bot]` suffix, so we
 * treat that as Bot-owned too. We deliberately do NOT pattern-match bare
 * "bot" inside the login ("robot", "botmaster", "bootstrap") — that would
 * false-positive on human accounts.
 */
export function isBotOwner(owner: {
  type?: string | null;
  login?: string | null;
}): boolean {
  const type = owner.type?.toLowerCase();
  if (type === "bot") return true;
  const login = owner.login?.toLowerCase() ?? "";
  // `[...]` suffix — the unambiguous GitHub bot convention, e.g. dependabot[bot]
  return /\[bot\]$/.test(login);
}
