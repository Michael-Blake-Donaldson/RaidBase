import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    profile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { GET, PATCH } from "@/app/api/settings/profile/route";

describe("settings profile route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 404 when profile does not exist", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(db.profile.findUnique).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(404);
  });

  it("rejects invalid payload", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);

    const request = new Request("http://localhost/api/settings/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayName: "x" }),
    });

    const response = await PATCH(request);
    expect(response.status).toBe(400);
  });

  it("updates and normalizes valid payload", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(db.profile.update).mockResolvedValue({
      displayName: "Ghost",
      bio: null,
      region: "NA Central",
      timezone: "America/Chicago",
      language: null,
      micPreference: "Required",
      schedule: null,
      updatedAt: new Date(),
    } as never);

    const request = new Request("http://localhost/api/settings/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        displayName: " Ghost ",
        bio: "",
        region: " NA Central ",
        timezone: " America/Chicago ",
        language: "",
        micPreference: " Required ",
        schedule: "",
      }),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(200);
    expect(db.profile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "u1" },
        data: expect.objectContaining({
          displayName: "Ghost",
          bio: null,
          region: "NA Central",
          timezone: "America/Chicago",
          language: null,
          micPreference: "Required",
          schedule: null,
        }),
      }),
    );
  });
});
