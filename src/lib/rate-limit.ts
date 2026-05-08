import { createHash } from "crypto";

import { getRateLimitEnv } from "@/lib/env";

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

function enforceMemoryRateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
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

function normalizeRateLimitKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

async function enforceUpstashRateLimit(
  { key, limit, windowMs }: RateLimitOptions,
  config: { restUrl: string; restToken: string },
): Promise<RateLimitResult | null> {
  const safeKey = `rate:${normalizeRateLimitKey(key)}`;

  try {
    const response = await fetch(`${config.restUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.restToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", safeKey],
        ["PEXPIRE", safeKey, windowMs, "NX"],
        ["PTTL", safeKey],
      ]),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Array<{ result?: number; error?: string }>;
    const currentCount = Number(payload[0]?.result ?? 0);
    const ttl = Math.max(0, Number(payload[2]?.result ?? 0));

    if (!Number.isFinite(currentCount) || currentCount <= 0) {
      return null;
    }

    if (currentCount > limit) {
      return {
        ok: false,
        remaining: 0,
        retryAfterMs: ttl,
      };
    }

    return {
      ok: true,
      remaining: Math.max(0, limit - currentCount),
      retryAfterMs: 0,
    };
  } catch {
    return null;
  }
}

export async function enforceRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const config = getRateLimitEnv();

  if (config.provider === "upstash" && config.restUrl && config.restToken) {
    const remoteResult = await enforceUpstashRateLimit(options, {
      restUrl: config.restUrl,
      restToken: config.restToken,
    });

    if (remoteResult) {
      return remoteResult;
    }
  }

  return enforceMemoryRateLimit(options);
}