type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterMs: number;
};

const store = new Map<string, number[]>();

export function enforceRateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (store.get(key) ?? []).filter((timestamp) => timestamp >= windowStart);
  const nextCount = timestamps.length + 1;

  if (nextCount > limit) {
    const oldest = timestamps[0] ?? now;
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + windowMs - now),
    };
  }

  timestamps.push(now);
  store.set(key, timestamps);

  return {
    ok: true,
    remaining: Math.max(0, limit - nextCount),
    retryAfterMs: 0,
  };
}