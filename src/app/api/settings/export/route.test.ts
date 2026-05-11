import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/observability", () => ({
  emitObservabilityEvent: vi.fn(),
  getRequestId: vi.fn().mockResolvedValue("req_export_123"),
}));

import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { GET } from "@/app/api/settings/export/route";

describe("settings export route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);

    const body = (await response.json()) as {
      success: boolean;
      error: {
        code: string;
        message: string;
      };
    };

    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 404 when account is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(404);

    const body = (await response.json()) as {
      success: boolean;
      error: {
        code: string;
        message: string;
      };
    };

    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns downloadable json export for account data", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "u1",
      email: "ghosttrace@raidbase.gg",
      username: "ghosttrace",
      role: "ADMIN",
      status: "ACTIVE",
      emailVerifiedAt: new Date("2026-01-01T00:00:00.000Z"),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      lastLoginAt: null,
      profile: null,
      userGames: [],
      createdLfgPosts: [],
      lfgApplications: [],
      ownedSquads: [],
      squadMembership: [],
      sessionRecords: [],
      writtenReviews: [],
      receivedReviews: [],
      reputation: null,
      clips: [],
      notifications: [],
      subscription: null,
      reportsFiled: [],
    } as never);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("content-disposition")).toContain("raidbase-export-ghosttrace");

    const body = await response.json();
    expect(body.user.id).toBe("u1");
    expect(body.user.username).toBe("ghosttrace");
  });

  it("returns 500 with standardized error payload when export fails unexpectedly", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(db.user.findUnique).mockRejectedValue(new Error("db down"));

    const response = await GET();
    const body = (await response.json()) as {
      success: boolean;
      error: {
        code: string;
        message: string;
      };
    };

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});
