import { describe, it, expect } from "vitest";
import { TokenBucketRateLimiter } from "../src/rate-limiter.js";

describe("TokenBucketRateLimiter", () => {
  it("allows consumption when tokens are available", () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 5, refillRatePerSec: 1 });
    expect(limiter.tryConsume(3)).toBe(true);
    expect(Math.floor(limiter.getAvailableTokens())).toBeLessThanOrEqual(2);
  });

  it("denies consumption when quota is exceeded", () => {
    const limiter = new TokenBucketRateLimiter({ capacity: 2, refillRatePerSec: 1 });
    expect(limiter.tryConsume(2)).toBe(true);
    expect(limiter.tryConsume(1)).toBe(false);
  });

  it("calculates exponential backoff delay with jitter", () => {
    const delay0 = TokenBucketRateLimiter.calculateBackoffDelay(0, {
      maxRetries: 3,
      baseDelayMs: 100,
      maxDelayMs: 1000,
    });
    const delay2 = TokenBucketRateLimiter.calculateBackoffDelay(2, {
      maxRetries: 3,
      baseDelayMs: 100,
      maxDelayMs: 1000,
    });

    expect(delay0).toBeGreaterThanOrEqual(100);
    expect(delay2).toBeGreaterThanOrEqual(400);
  });

  it("throws error for non-positive config", () => {
    expect(() => new TokenBucketRateLimiter({ capacity: 0, refillRatePerSec: 1 })).toThrow();
  });
});
