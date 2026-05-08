import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    notification: {
      findFirst: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { PATCH } from "@/app/api/notifications/[notificationId]/route";

describe("notification mutation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost/api/notifications/n1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ notificationId: "n1" }) });
    expect(response.status).toBe(401);
  });

  it("rejects invalid actions", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);

    const request = new Request("http://localhost/api/notifications/n1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "archive" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ notificationId: "n1" }) });
    expect(response.status).toBe(400);
  });

  it("dismisses owned notifications", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(db.notification.findFirst).mockResolvedValue({ id: "n1" } as never);

    const request = new Request("http://localhost/api/notifications/n1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "dismiss" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ notificationId: "n1" }) });
    expect(response.status).toBe(200);
    expect(db.notification.delete).toHaveBeenCalledWith({ where: { id: "n1" } });
  });

  it("marks owned notifications as accepted", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(db.notification.findFirst).mockResolvedValue({ id: "n1" } as never);

    const request = new Request("http://localhost/api/notifications/n1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ notificationId: "n1" }) });
    expect(response.status).toBe(200);
    expect(db.notification.update).toHaveBeenCalledWith({
      where: { id: "n1" },
      data: { readAt: expect.any(Date) },
    });
  });
});