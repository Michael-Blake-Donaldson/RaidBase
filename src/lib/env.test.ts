import { afterEach, describe, expect, it, vi } from "vitest";

async function loadEnvModule() {
  vi.resetModules();
  return import("@/lib/env");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env helpers", () => {
  it("provides development auth secret fallback", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXTAUTH_SECRET", "");

    const { getAuthSecret } = await loadEnvModule();
    expect(getAuthSecret()).toBe("raidbase-dev-only-secret");
  });

  it("throws in production strict mode when required auth secret is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("STRICT_ENV_VALIDATION", "true");
    vi.stubEnv("NEXTAUTH_SECRET", "");

    const { getAuthSecret } = await loadEnvModule();
    expect(() => getAuthSecret()).toThrowError("NEXTAUTH_SECRET is required in production.");
  });

  it("returns null stripe values when not configured in non-production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    vi.stubEnv("STRIPE_PRO_PRICE_ID", "");

    const { getStripeEnv } = await loadEnvModule();
    expect(getStripeEnv()).toEqual({
      secretKey: null,
      webhookSecret: null,
      proPriceId: null,
    });
  });
});
