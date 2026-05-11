import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/request", () => ({
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn(),
}));

vi.mock("@/lib/auth/username", () => ({
  validateUsername: vi.fn(),
}));

vi.mock("@/server/services/email", () => ({
  sendEmailVerification: vi.fn().mockResolvedValue(undefined),
}));

import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { validateUsername } from "@/lib/auth/username";
import { enforceRateLimit } from "@/lib/rate-limit";
import { POST } from "@/app/api/auth/register/route";

describe("register route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockResolvedValue({ ok: true, remaining: 7, retryAfterMs: 0 });
    vi.mocked(validateUsername).mockReturnValue({ ok: true, normalized: "ghosttrace" } as never);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
  });

  it("returns 429 when registration attempts are rate limited", async () => {
    vi.mocked(enforceRateLimit).mockResolvedValue({ ok: false, remaining: 0, retryAfterMs: 20_000 });

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "ghost@example.com",
        username: "GhostTrace",
        password: "hunter22!",
        region: "NA",
        timezone: "America/New_York",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("20");
  });

  it("rejects duplicate accounts", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue({ id: "u1" } as never);

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "ghost@example.com",
        username: "GhostTrace",
        password: "hunter22!",
        region: "NA",
        timezone: "America/New_York",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });

  it("creates a new account after passing validation and throttling", async () => {
    vi.mocked(db.user.findFirst).mockResolvedValue(null);
    vi.mocked(db.user.create).mockResolvedValue({
      id: "u2",
      email: "ghost@example.com",
      username: "ghosttrace",
    } as never);

    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "ghost@example.com",
        username: "GhostTrace",
        password: "hunter22!",
        region: "NA",
        timezone: "America/New_York",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(bcrypt.hash).toHaveBeenCalledWith("hunter22!", 12);
    expect(db.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "ghost@example.com",
          username: "ghosttrace",
        }),
      }),
    );
  });
});