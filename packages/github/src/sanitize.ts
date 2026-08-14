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
