import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { getStripeEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

function mapSubscriptionStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE" as const;
    case "past_due":
    case "unpaid":
      return "PAST_DUE" as const;
    case "canceled":
      return "CANCELED" as const;
    default:
      return "INACTIVE" as const;
  }
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const { webhookSecret } = getStripeEnv();

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = String(subscription.customer);

    await db.subscription.updateMany({
      where: {
        stripeCustomerId: customerId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        status: mapSubscriptionStatus(subscription.status),
        plan: mapSubscriptionStatus(subscription.status) === "ACTIVE" ? "PRO" : "FREE",
        currentPeriodEnd: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000)
          : null,
      },
    });
  }

  return NextResponse.json({ received: true });
}