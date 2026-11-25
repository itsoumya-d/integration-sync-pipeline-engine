export interface RateLimiterOptions {
  capacity: number;
  refillRatePerSec: number;
}

export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export class TokenBucketRateLimiter {
  private tokens: number;
  private lastRefillTimestamp: number;
  private readonly capacity: number;
  private readonly refillRatePerSec: number;

  constructor(options: RateLimiterOptions) {
    if (options.capacity <= 0 || options.refillRatePerSec <= 0) {
      throw new Error("Capacity and refill rate must be positive values");
    }
    this.capacity = options.capacity;
    this.refillRatePerSec = options.refillRatePerSec;
    this.tokens = options.capacity;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefillTimestamp) / 1000;
    if (elapsedSec > 0) {
      const addedTokens = elapsedSec * this.refillRatePerSec;
      this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
      this.lastRefillTimestamp = now;
    }
  }

  public tryConsume(tokens: number = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  public getAvailableTokens(): number {
    this.refill();
    return this.tokens;
  }

  public static calculateBackoffDelay(
    attempt: number,
    policy: RetryPolicy = { maxRetries: 5, baseDelayMs: 100, maxDelayMs: 2000 }
  ): number {
    const exponential = Math.min(policy.maxDelayMs, policy.baseDelayMs * Math.pow(2, attempt));
    const jitter = Math.random() * 0.3 * exponential;
    return Math.floor(exponential + jitter);
  }
}
