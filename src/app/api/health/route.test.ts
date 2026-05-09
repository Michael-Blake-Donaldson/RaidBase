import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@/lib/env", () => ({
  getObservabilityEnv: vi.fn(() => ({
    serviceName: "raidbase-web",
    environment: "test",
    webhookUrl: null,
  })),
}));

vi.mock("@/lib/observability", () => ({
  getRequestId: vi.fn().mockResolvedValue("req_health_123"),
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
    const body = (await response.json()) as {
      status: string;
      service: string;
      environment: string;
      requestId: string;
      checks: { database: string };
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("raidbase-web");
    expect(body.environment).toBe("test");
    expect(body.requestId).toBe("req_health_123");
    expect(body.checks.database).toBe("pass");
  });

  it("returns degraded when database check fails", async () => {
    vi.mocked(db.$queryRaw).mockRejectedValue(new Error("db unavailable"));

    const response = await GET();
    const body = (await response.json()) as {
      status: string;
      service: string;
      environment: string;
      requestId: string;
      checks: { database: string };
    };

    expect(response.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.service).toBe("raidbase-web");
    expect(body.environment).toBe("test");
    expect(body.requestId).toBe("req_health_123");
    expect(body.checks.database).toBe("fail");
  });
});
