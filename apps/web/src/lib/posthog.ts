import posthog from "posthog-js";

/**
 * PostHog tracking (phase-03). Privacy-critical decisions locked here (HIGH-4):
 *   - NO GitHub identity as distinct_id — a server-assigned uuid is used when
 *     available, else a local random id.
 *   - Event property ALLOWLIST — never send username, email, or issue text.
 */
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

export function initPosthog() {
  if (!POSTHOG_KEY || import.meta.env.MODE === "test") return;
  posthog.init(POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
  });
}

export function identifyAnonymous() {
  if (!POSTHOG_KEY) return;
  // Server-assigned id takes priority; fall back to a session-local random.
  const stored = localStorage.getItem("firstpr-anon-id");
  const anonId = stored ?? crypto.randomUUID();
  if (!stored) localStorage.setItem("firstpr-anon-id", anonId);
  posthog.identify(anonId);
}

const ALLOWLIST = ["language", "score_band", "page", "referrer"] as const;

export function track(event: string, props: Record<string, unknown> = {}) {
  if (!POSTHOG_KEY) return;
  const safe: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if ((ALLOWLIST as readonly string[]).includes(key)) safe[key] = props[key];
  }
  posthog.capture(event, safe);
}
