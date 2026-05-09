import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/observability", () => ({
  emitObservabilityEvent: vi.fn(),
  getRequestId: vi.fn().mockResolvedValue("req_vitals_123"),
}));

import { emitObservabilityEvent } from "@/lib/observability";
import { POST } from "@/app/api/vitals/route";

describe("vitals route", () => {
  it("returns 400 for invalid payloads", async () => {
    const request = new Request("http://localhost/api/vitals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bad: true }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, requestId: "req_vitals_123" });
  });

  it("emits structured observability events for valid metrics", async () => {
    const request = new Request("http://localhost/api/vitals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: "vital_1",
        name: "LCP",
        value: 1200,
        rating: "good",
        delta: 1200,
        navigationType: "navigate",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, requestId: "req_vitals_123" });
    expect(emitObservabilityEvent).toHaveBeenCalledWith({
      event: "web_vital_recorded",
      requestId: "req_vitals_123",
      payload: {
        id: "vital_1",
        name: "LCP",
        value: 1200,
        rating: "good",
        delta: 1200,
        navigationType: "navigate",
      },
    });
  });
});