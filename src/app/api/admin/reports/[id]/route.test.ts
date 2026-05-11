import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    report: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    moderationAction: {
      create: vi.fn(),
    },
    user: {
      updateMany: vi.fn(),
    },
  },
}));

import { getServerSession } from "next-auth";

import { db } from "@/lib/db";
import { PATCH } from "@/app/api/admin/reports/[id]/route";

describe("admin report update route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forbids non-moderators", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { role: "USER" } } as never);

    const request = new Request("http://localhost/api/admin/reports/r1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "IN_REVIEW" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "r1" }) });
    expect(response.status).toBe(403);
  });

  it("rejects invalid moderation updates", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "m1", role: "ADMIN" } } as never);

    const request = new Request("http://localhost/api/admin/reports/r1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "r1" }) });
    expect(response.status).toBe(400);
  });

  it("records moderator ownership when updating a report", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "m1", role: "ADMIN" } } as never);
    vi.mocked(db.report.findUnique).mockResolvedValue({
      id: "r1",
      targetType: "USER",
      targetId: "ghosttrace",
      reportedUserId: "u2",
      reason: "Toxic behavior",
    } as never);
    vi.mocked(db.report.update).mockResolvedValue({ id: "r1", status: "IN_REVIEW", moderatorId: "m1" } as never);
    vi.mocked(db.moderationAction.create).mockResolvedValue({ id: "a1", type: "WARN_USER" } as never);

    const request = new Request("http://localhost/api/admin/reports/r1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "IN_REVIEW", details: "Escalated for review." }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "r1" }) });
    expect(response.status).toBe(200);
    expect(db.report.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: {
        status: "IN_REVIEW",
        details: "Escalated for review.",
        moderatorId: "m1",
      },
    });
    expect(db.moderationAction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reportId: "r1",
          moderatorId: "m1",
          type: "WARN_USER",
        }),
      }),
    );
  });

  it("returns 404 when the report does not exist", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "m1", role: "ADMIN" } } as never);
    vi.mocked(db.report.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost/api/admin/reports/missing", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "ACTION_TAKEN" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "missing" }) });
    expect(response.status).toBe(404);
  });

  it("enforces suspended status for user targets when action is suspend", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "m1", role: "ADMIN" } } as never);
    vi.mocked(db.report.findUnique).mockResolvedValue({
      id: "r1",
      targetType: "USER",
      targetId: "ghosttrace",
      reportedUserId: "u2",
      reason: "Repeated abuse",
    } as never);
    vi.mocked(db.report.update).mockResolvedValue({ id: "r1", status: "ACTION_TAKEN", moderatorId: "m1" } as never);
    vi.mocked(db.moderationAction.create).mockResolvedValue({ id: "a2", type: "SUSPEND_USER" } as never);
    vi.mocked(db.user.updateMany).mockResolvedValue({ count: 1 } as never);

    const request = new Request("http://localhost/api/admin/reports/r1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "ACTION_TAKEN", actionType: "SUSPEND_USER", actionReason: "7-day suspension" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "r1" }) });
    expect(response.status).toBe(200);
    expect(db.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "SUSPENDED" },
      }),
    );
  });
});