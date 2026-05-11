import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import { GET } from "@/app/api/reputation/[username]/route";

describe("reputation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when reputation is not found", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost/api/reputation/ghosttrace");
    const response = await GET(request, { params: Promise.resolve({ username: "ghosttrace" }) });

    expect(response.status).toBe(404);
  });

  it("returns trust summary when reputation exists", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      reputation: {
        reliabilityScore: 4.7,
        commsScore: 4.5,
        skillScore: 4.4,
        teamBehaviorScore: 4.6,
        toxicityRisk: 9,
        reviewCount: 7,
        uniqueReviewers: 5,
        publicBadges: ["Reliable", "Great Comms"],
      },
    } as never);

    const request = new Request("http://localhost/api/reputation/ghosttrace");
    const response = await GET(request, { params: Promise.resolve({ username: "ghosttrace" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.reputation.trust).toEqual(
      expect.objectContaining({
        trustScore: expect.any(Number),
        tier: expect.any(String),
      }),
    );
    expect(body.data.reputation.reviewCount).toBe(7);
  });
});
