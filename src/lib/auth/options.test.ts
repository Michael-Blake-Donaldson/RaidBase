import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@next-auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({ adapter: true })),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((config) => config),
}));

vi.mock("@/lib/env", () => ({
  getAppBaseUrl: vi.fn(() => "http://localhost:3000"),
  getAuthSecret: vi.fn(() => "test-secret"),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue({ ok: true, remaining: 9, retryAfterMs: 0 }),
}));

import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth/options";

describe("authOptions callbacks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("clears JWT identity when the backing user no longer exists", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const token = await authOptions.callbacks!.jwt!({
      token: {
        sub: "u1",
        role: "ADMIN",
        username: "ghosttrace",
        active: true,
      },
      user: null as never,
      account: null,
    });

    expect(token.sub).toBeUndefined();
    expect(token.role).toBeUndefined();
    expect(token.username).toBeUndefined();
    expect(token.active).toBe(false);
  });

  it("refreshes JWT identity from the current active user record", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "u1",
      role: "MODERATOR",
      status: "ACTIVE",
      username: "raidlead",
    } as never);

    const token = await authOptions.callbacks!.jwt!({
      token: {
        sub: "u1",
        role: "USER",
        username: "ghosttrace",
      },
      user: null as never,
      account: null,
    });

    expect(token.sub).toBe("u1");
    expect(token.role).toBe("MODERATOR");
    expect(token.username).toBe("raidlead");
    expect(token.active).toBe(true);
  });

  it("invalidates JWT identity when the user is suspended", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "u1",
      role: "USER",
      status: "SUSPENDED",
      username: "raidlead",
    } as never);

    const token = await authOptions.callbacks!.jwt!({
      token: {
        sub: "u1",
        role: "USER",
        username: "raidlead",
      },
      user: null as never,
      account: null,
    });

    expect(token.sub).toBeUndefined();
    expect(token.role).toBeUndefined();
    expect(token.username).toBeUndefined();
    expect(token.active).toBe(false);
  });

  it("clears session identity when the token has been invalidated", async () => {
    const session = await authOptions.callbacks!.session!({
      session: {
        user: {
          id: "u1",
          role: "ADMIN",
          username: "ghosttrace",
          email: "ghost@example.com",
        },
        expires: new Date(Date.now() + 60_000).toISOString(),
      } as never,
      token: {
        active: false,
      },
      user: null as never,
      newSession: null,
      trigger: "update" as never,
    });

    expect((session as never as { user: { id: string; role: string; username: string } }).user.id).toBe("");
    expect((session as never as { user: { id: string; role: string; username: string } }).user.role).toBe("USER");
    expect((session as never as { user: { id: string; role: string; username: string } }).user.username).toBe("");
  });
});