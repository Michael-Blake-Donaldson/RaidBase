import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    billingWebhookEvent: {
      create: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/env", () => ({
  getStripeEnv: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(),
}));

vi.mock("@/server/services/billing", () => ({
  syncSubscriptionFromStripeSubscription: vi.fn(),
}));

vi.mock("@/server/services/notifications", () => ({
  createUserNotification: vi.fn(),
}));

import { db } from "@/lib/db";
import { getStripeEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { POST } from "@/app/api/billing/webhook/route";
import { syncSubscriptionFromStripeSubscription } from "@/server/services/billing";

describe("billing webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 when billing is not configured", async () => {
    vi.mocked(getStripe).mockReturnValue(null);
    vi.mocked(getStripeEnv).mockReturnValue({
      secretKey: null,
      webhookSecret: null,
      proPriceId: null,
    });

    const request = new Request("http://localhost/api/billing/webhook", {
      method: "POST",
      body: "{}",
    });

    const response = await POST(request);
    expect(response.status).toBe(503);
  });

  it("short-circuits duplicate events after the idempotency insert fails", async () => {
    const stripe = {
      webhooks: {
        constructEvent: vi.fn().mockReturnValue({
          id: "evt_123",
          type: "invoice.paid",
          data: { object: { customer: "cus_123" } },
        }),
      },
    };

    vi.mocked(getStripe).mockReturnValue(stripe as never);
    vi.mocked(getStripeEnv).mockReturnValue({
      secretKey: "sk_test_123",
      webhookSecret: "whsec_123",
      proPriceId: "price_123",
    });
    vi.mocked(db.billingWebhookEvent.create).mockRejectedValue(new Error("duplicate"));

    const request = new Request("http://localhost/api/billing/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig_123" },
      body: "{}",
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, duplicate: true });
    expect(syncSubscriptionFromStripeSubscription).not.toHaveBeenCalled();
  });
});