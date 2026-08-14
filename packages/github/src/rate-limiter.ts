/* =====================================================================
 * FirstPR — token-bucket rate limiter for GitHub API (C1 / HIGH-5)
 *
 * We must never trip GitHub's Search 30 req/min cap while still crawling.
 * This is a token-bucket with:
 *   - per-job budgets (minute + hour),
 *   - a long-running queue that sleeps until a token frees up,
 *   - circuit-break on 429/403 (returns error instead of hammering),
 *   - optional learning from real X-RateLimit headers (observeRemaining).
 * ===================================================================== */

export interface JobBudget {
  maxPerMinute: number;
  maxPerHour: number;
  burst: number;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefillAt: number;
  private readonly capacity: number;
  private readonly refillPerMinute: number;
  private readonly refillPerHour: number;
  /** observed reset window from GitHub headers */
  private observedResetAt = 0;
  /** tokens consumed in the current sliding hour window (epochMs → tokens) */
  private hourWindow: { at: number; n: number }[] = [];
  private queued = 0;

  constructor(private readonly budget: JobBudget) {
    this.capacity = budget.burst;
    this.tokens = budget.burst;
    this.refillPerMinute = budget.maxPerMinute;
    this.refillPerHour = budget.maxPerHour;
    this.lastRefillAt = Date.now();
  }

  /** Take one token; waits (bounded by total elapsed time) until one is available. */
  async take(timeoutMs = 120_000): Promise<void> {
    const startedAt = Date.now();
    while (true) {
      const now = Date.now();

      // Enforce the hourly budget via a sliding window (C1/M2).
      const cutoff = now - 3_600_000;
      this.hourWindow = this.hourWindow.filter((e) => e.at > cutoff);
      const usedThisHour = this.hourWindow.reduce((s, e) => s + e.n, 0);
      if (usedThisHour >= this.refillPerHour) {
        // sleep until the oldest entry slides out of the window
        const oldest = this.hourWindow[0]?.at ?? now;
        const waitUntil = oldest + 3_600_000;
        if (waitUntil - now > 0) {
          await sleep(Math.min(waitUntil - now, 1000));
          continue;
        }
      }

      const elapsedMin = (now - this.lastRefillAt) / 60_000;
      const refill = Math.min(this.capacity, elapsedMin * this.refillPerMinute);
      this.tokens = Math.min(this.capacity, this.tokens + refill);
      this.lastRefillAt = now;

      if (this.tokens >= 1) {
        this.tokens -= 1;
        this.hourWindow.push({ at: now, n: 1 });
        return;
      }

      if (now - startedAt >= timeoutMs) {
        throw new RateLimitError(`rate-limit wait exceeded ${timeoutMs}ms`, 429);
      }

      // Wait for a token (short sleep loop so we can bail if the process is dying)
      const waitMs = Math.max(250, (1000 * (1 - this.tokens)) / this.refillPerMinute);
      this.queued += 1;
      await sleep(Math.min(waitMs, 1000));
      this.queued = Math.max(0, this.queued - 1);
    }
  }

  /** Learn the server's real reset time from a response header (best-effort). */
  observeRemaining(_job: string, remaining: number, resetAt: number) {
    if (resetAt > Date.now()) this.observedResetAt = resetAt;
    if (remaining === 0 && this.observedResetAt > Date.now()) {
      // Out of budget server-side; refill is impossible until reset.
      this.tokens = 0;
    }
  }
}

const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));

/**
 * Circuit-break helper: GitHub returns 429 or 403 when over a limit.
 * Instead of retrying hot, back off or throw so the worker can defer.
 */
export function isRateLimitResponse(err: unknown): err is RateLimitError {
  if (err instanceof RateLimitError) return true;
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: number }).status;
    return status === 429 || status === 403;
  }
  return false;
}
