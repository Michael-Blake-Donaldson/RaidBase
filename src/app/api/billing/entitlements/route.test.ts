import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/server/services/entitlements", () => ({
  getUserEntitlements: vi.fn(),
}));

import { getServerSession } from "next-auth";

import { GET } from "@/app/api/billing/entitlements/route";
import { getUserEntitlements } from "@/server/services/entitlements";

describe("billing entitlements route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Authentication required." });
  });

  it("returns live entitlements for the authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(getUserEntitlements).mockResolvedValue({
      plan: "PRO",
      status: "ACTIVE",
      clipLimit: 10,
      isPro: true,
      entitlements: {
        profileThemes: true,
        extraClipSlots: true,
        advancedFilters: true,
        squadAnalytics: true,
        boostedDiscovery: true,
      },
    });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(getUserEntitlements).toHaveBeenCalledWith("u1");
    expect(await response.json()).toMatchObject({
      plan: "PRO",
      clipLimit: 10,
      isPro: true,
    });
  });
});