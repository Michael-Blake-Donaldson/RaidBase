import Stripe from "stripe";

import { getStripeEnv } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const { secretKey: apiKey } = getStripeEnv();
  if (!apiKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(apiKey, {
      apiVersion: "2025-08-27.basil",
    });
  }

  return stripeClient;
}