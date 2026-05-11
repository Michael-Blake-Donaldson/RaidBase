import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/require-user", () => ({
  requireUser: vi.fn(),
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
      findFirst: vi.fn(),
    },
  },
}));

import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { GET } from "@/app/api/reviews/eligibility/route";

describe("review eligibility route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(requireUser).mockRejectedValue(new AppError("UNAUTHORIZED", "Sign in required.", 401));

    const request = new Request("http://localhost/api/reviews/eligibility?reviewedUsername=ghosttrace&sessionId=session-1");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid query parameters", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "u1" } as never);

    const request = new Request("http://localhost/api/reviews/eligibility?reviewedUsername=ab");
    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it("returns false for self-review attempts", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "u1", username: "alpha" } as never);

    const request = new Request("http://localhost/api/reviews/eligibility?reviewedUsername=alpha&sessionId=session-12345");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ eligible: false, reason: "SELF_REVIEW" });
  });

  it("returns false when users do not share a verified session", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "u2", username: "ghosttrace" } as never);
    vi.mocked(db.sessionParticipant.count).mockResolvedValue(1 as never);

    const request = new Request("http://localhost/api/reviews/eligibility?reviewedUsername=ghosttrace&sessionId=session-12345");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ eligible: false, reason: "NO_SHARED_VERIFIED_SESSION" });
  });

  it("returns false when duplicate review already exists", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "u2", username: "ghosttrace" } as never);
    vi.mocked(db.sessionParticipant.count).mockResolvedValue(2 as never);
    vi.mocked(db.review.findFirst).mockResolvedValue({ id: "r1" } as never);

    const request = new Request("http://localhost/api/reviews/eligibility?reviewedUsername=ghosttrace&sessionId=session-12345");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ eligible: false, reason: "ALREADY_REVIEWED" });
  });

  it("returns true when review is allowed", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: "u2", username: "ghosttrace" } as never);
    vi.mocked(db.sessionParticipant.count).mockResolvedValue(2 as never);
    vi.mocked(db.review.findFirst).mockResolvedValue(null);

    const request = new Request("http://localhost/api/reviews/eligibility?reviewedUsername=ghosttrace&sessionId=session-12345");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({
      eligible: true,
      reviewedUser: {
        id: "u2",
        username: "ghosttrace",
      },
    });
  });
});
