import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

async function loadRateLimitModule() {
  vi.resetModules();
  return import("@/lib/rate-limit");
}

describe("rate limit service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("STRICT_ENV_VALIDATION", "false");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses in-memory fallback when no shared provider is configured", async () => {
    const { enforceRateLimit } = await loadRateLimitModule();

    const first = await enforceRateLimit({ key: "memory:test", limit: 2, windowMs: 60_000 });
    const second = await enforceRateLimit({ key: "memory:test", limit: 2, windowMs: 60_000 });
    const third = await enforceRateLimit({ key: "memory:test", limit: 2, windowMs: 60_000 });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(third.ok).toBe(false);
    expect(third.retryAfterMs).toBeGreaterThanOrEqual(0);
  });

  it("falls back to memory when the shared provider request fails", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example-rate-limit.test");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "token-value");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

    const { enforceRateLimit } = await loadRateLimitModule();

    const first = await enforceRateLimit({ key: "remote:fallback", limit: 1, windowMs: 60_000 });
    const second = await enforceRateLimit({ key: "remote:fallback", limit: 1, windowMs: 60_000 });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
  });
});