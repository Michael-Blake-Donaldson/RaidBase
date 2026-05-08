import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    notification: {
      findMany: vi.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { GET } from "@/app/api/notifications/route";

describe("notifications route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fallback notification items for guests", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();
    const body = (await response.json()) as { items: Array<{ persisted: boolean }> };

    expect(response.status).toBe(200);
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items.every((item) => item.persisted === false)).toBe(true);
  });

  it("maps persisted notifications for authenticated users", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(db.notification.findMany).mockResolvedValue([
      {
        id: "n1",
        title: "Squad invite",
        body: "A squad invited you.",
        linkUrl: "/squads",
        type: "squad_invite",
        createdAt: new Date("2026-05-08T10:00:00.000Z"),
        readAt: null,
      },
      {
        id: "n2",
        title: "Billing updated",
        body: "Subscription status changed.",
        linkUrl: null,
        type: "billing_subscription_updated",
        createdAt: new Date("2026-05-08T09:00:00.000Z"),
        readAt: new Date("2026-05-08T09:30:00.000Z"),
      },
    ] as never);

    const response = await GET();
    const body = (await response.json()) as {
      items: Array<{ id: string; category: string; priority: string; href: string; resolved: boolean; persisted: boolean }>;
    };

    expect(response.status).toBe(200);
    expect(body.items).toEqual([
      expect.objectContaining({
        id: "n1",
        category: "invite",
        priority: "High",
        href: "/squads",
        resolved: false,
        persisted: true,
      }),
      expect.objectContaining({
        id: "n2",
        category: "billing",
        priority: "Medium",
        href: "/",
        resolved: true,
        persisted: true,
      }),
    ]);
  });
});