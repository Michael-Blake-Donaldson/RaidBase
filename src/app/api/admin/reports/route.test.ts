import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    report: {
      findMany: vi.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { GET } from "@/app/api/admin/reports/route";

describe("admin reports route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forbids non-moderators", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { role: "USER" } } as never);

    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns the latest moderation queue for moderators", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "m1", role: "MODERATOR" } } as never);
    vi.mocked(db.report.findMany).mockResolvedValue([
      { id: "r1", severity: "HIGH", status: "OPEN" },
      { id: "r2", severity: "MEDIUM", status: "IN_REVIEW" },
    ] as never);

    const response = await GET();
    const body = (await response.json()) as { success: boolean; data: { reports: Array<{ id: string }> } };

    expect(response.status).toBe(200);
    expect(body.data.reports).toHaveLength(2);
    expect(db.report.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 50,
      }),
    );
  });
});