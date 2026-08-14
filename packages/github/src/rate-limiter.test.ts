import { describe, expect, it } from "vitest";
import { TokenBucketRateLimiter, isRateLimitResponse } from "./rate-limiter.js";

describe("TokenBucketRateLimiter", () => {
  it("allows up to burst immediately", async () => {
    const limiter = new TokenBucketRateLimiter({ maxPerMinute: 30, maxPerHour: 12_500, burst: 5 });
    for (let i = 0; i < 5; i++) {
      await limiter.take(200); // should not throw
    }
    expect.assertions(0);
  });

  it("throttles beyond burst for a constant burst budget", async () => {
    const limiter = new TokenBucketRateLimiter({ maxPerMinute: 60, maxPerHour: 12_500, burst: 2 });
    await limiter.take(100);
    await limiter.take(100);
    // third take with tiny timeout should throw (out of tokens)
    await expect(limiter.take(50)).rejects.toBeInstanceOf(Error);
  });
});

describe("isRateLimitResponse", () => {
  it("flags 429 and 403", () => {
    expect(isRateLimitResponse({ status: 429 })).toBe(true);
    expect(isRateLimitResponse({ status: 403 })).toBe(true);
    expect(isRateLimitResponse({ status: 200 })).toBe(false);
    expect(isRateLimitResponse(new Error("no"))).toBe(false);
  });
});