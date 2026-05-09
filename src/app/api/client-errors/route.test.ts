import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/observability", () => ({
  emitObservabilityEvent: vi.fn(),
  getRequestId: vi.fn().mockResolvedValue("req_client_123"),
}));

import { emitObservabilityEvent } from "@/lib/observability";
import { POST } from "@/app/api/client-errors/route";

describe("client errors route", () => {
  it("rejects invalid payloads", async () => {
    const request = new Request("http://localhost/api/client-errors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ digest: "d1" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ ok: false, requestId: "req_client_123" });
  });

  it("records valid client crash events", async () => {
    const request = new Request("http://localhost/api/client-errors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        digest: "digest_1",
        message: "Unexpected crash",
        stack: "stack trace",
        path: "/settings",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, requestId: "req_client_123" });
    expect(emitObservabilityEvent).toHaveBeenCalledWith({
      event: "client_error_reported",
      level: "error",
      requestId: "req_client_123",
      payload: {
        digest: "digest_1",
        message: "Unexpected crash",
        stack: "stack trace",
        path: "/settings",
      },
    });
  });
});