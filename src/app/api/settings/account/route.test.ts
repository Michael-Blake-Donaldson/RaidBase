import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("@/lib/request", () => ({
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn(),
}));

vi.mock("@/lib/observability", () => ({
  emitObservabilityEvent: vi.fn(),
  getRequestId: vi.fn().mockResolvedValue("req_account_123"),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { DELETE } from "@/app/api/settings/account/route";

describe("settings account delete route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockResolvedValue({ ok: true, remaining: 4, retryAfterMs: 0 });
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost/api/settings/account", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "ghosttrace", confirmationText: "DELETE", password: "password123" }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(401);
  });

  it("returns 429 when deletion attempts are rate-limited", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", username: "ghosttrace" } } as never);
    vi.mocked(enforceRateLimit).mockResolvedValue({ ok: false, remaining: 0, retryAfterMs: 30_000 });

    const request = new Request("http://localhost/api/settings/account", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "ghosttrace", confirmationText: "DELETE", password: "password123" }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(429);
  });

  it("returns 403 on invalid password", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", username: "ghosttrace" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "u1", passwordHash: "hash" } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const request = new Request("http://localhost/api/settings/account", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "ghosttrace", confirmationText: "DELETE", password: "password123" }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(403);
  });

  it("deletes account when confirmation and password are valid", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", username: "ghosttrace" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "u1", passwordHash: "hash" } as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(db.user.delete).mockResolvedValue({ id: "u1" } as never);

    const request = new Request("http://localhost/api/settings/account", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "ghosttrace", confirmationText: "DELETE", password: "password123" }),
    });

    const response = await DELETE(request);
    expect(response.status).toBe(200);
    expect(db.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
  });
});
