import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    sessionParticipant: {
      count: vi.fn(),
    },
    review: {
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

vi.mock("@/server/services/notifications", () => ({
  createUserNotifications: vi.fn(),
}));

vi.mock("@/server/services/reputation", () => ({
  recomputeReputationAggregate: vi.fn(),
}));

import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { POST } from "@/app/api/reviews/route";
import { createUserNotifications } from "@/server/services/notifications";
import { recomputeReputationAggregate } from "@/server/services/reputation";

const validPayload = {
  reviewedUsername: "ghosttrace",
  sessionId: "session-12345",
  reliability: 5,
  communication: 4,
  skillFit: 5,
  teamBehavior: 5,
  repeatTeammate: true,
  tags: ["calm", "clutch"],
  comment: "Great teammate.",
  visibility: "PUBLIC",
};

describe("reviews route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enforceRateLimit).mockReturnValue({ ok: true, remaining: 19, retryAfterMs: 0 });
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", username: "alpha" } } as never);
    vi.mocked(enforceRateLimit).mockReturnValue({ ok: false, remaining: 0, retryAfterMs: 45_000 });

    const request = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("45");
  });

  it("rejects self reviews", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", username: "alpha" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "u1", username: "alpha" } as never);

    const request = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...validPayload, reviewedUsername: "alpha" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("rejects reviews without a shared session", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", username: "alpha" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "u2", username: "ghosttrace" } as never);
    vi.mocked(db.sessionParticipant.count).mockResolvedValue(1 as never);

    const request = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("creates a review and triggers downstream updates", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1", username: "alpha" } } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "u2", username: "ghosttrace" } as never);
    vi.mocked(db.sessionParticipant.count).mockResolvedValue(2 as never);
    vi.mocked(db.review.create).mockResolvedValue({ id: "r1" } as never);

    const request = new Request("http://localhost/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validPayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(db.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reviewerId: "u1",
          reviewedId: "u2",
          sessionId: validPayload.sessionId,
        }),
      }),
    );
    expect(recomputeReputationAggregate).toHaveBeenCalledWith("u2");
    expect(createUserNotifications).toHaveBeenCalledTimes(1);
  });
});