import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}));

import { db } from "@/lib/db";
import { GET } from "@/app/api/health/route";

describe("health route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok when database check passes", async () => {
    vi.mocked(db.$queryRaw).mockResolvedValue([{ "?column?": 1 }] as never);

    const response = await GET();
    const body = (await response.json()) as { status: string; checks: { database: string } };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.database).toBe("pass");
  });

  it("returns degraded when database check fails", async () => {
    vi.mocked(db.$queryRaw).mockRejectedValue(new Error("db unavailable"));

    const response = await GET();
    const body = (await response.json()) as { status: string; checks: { database: string } };

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.database).toBe("fail");
  });
});
