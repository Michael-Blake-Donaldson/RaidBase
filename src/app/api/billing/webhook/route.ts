import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { getStripeEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { syncSubscriptionFromStripeSubscription } from "@/server/services/billing";
import { createUserNotification } from "@/server/services/notifications";

async function resolveUserIdForCustomer(stripe: Stripe, customerId: string) {
  const existing = await db.subscription.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
    select: {
      userId: true,
    },
  });

  if (existing?.userId) {
    return existing.userId;
  }

  const customer = await stripe.customers.retrieve(customerId);
  if (typeof customer === "string" || customer.deleted) {
    return null;
  }

  const userId = customer.metadata?.userId?.trim();
  return userId || null;
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

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object as Stripe.Checkout.Session;

    if (checkout.mode === "subscription" && checkout.subscription && checkout.customer) {
      const customerId = String(checkout.customer);
      const userIdFromMetadata = checkout.metadata?.userId?.trim();
      const userId = userIdFromMetadata || (await resolveUserIdForCustomer(stripe, customerId));

      if (userId) {
        const subscription = await stripe.subscriptions.retrieve(String(checkout.subscription));
        await syncSubscriptionFromStripeSubscription({
          userId,
          stripeCustomerId: customerId,
          subscription,
        });

        await createUserNotification({
          userId,
          type: "billing_checkout_completed",
          title: "Pro checkout completed",
          body: "Your subscription is now active and premium entitlements are enabled.",
          linkUrl: "/settings",
        });
      }
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = String(subscription.customer);
    const userIdFromMetadata = subscription.metadata?.userId?.trim();
    const userId = userIdFromMetadata || (await resolveUserIdForCustomer(stripe, customerId));

    if (userId) {
      await syncSubscriptionFromStripeSubscription({
        userId,
        stripeCustomerId: customerId,
        subscription,
      });

      await createUserNotification({
        userId,
        type: "billing_subscription_updated",
        title: "Subscription status updated",
        body: `Stripe reported status: ${subscription.status.replaceAll("_", " ")}.`,
        linkUrl: "/settings",
      });
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer ? String(invoice.customer) : null;

    if (customerId) {
      const userId = await resolveUserIdForCustomer(stripe, customerId);

      if (userId) {
        await db.subscription.updateMany({
          where: { userId },
          data: { status: "PAST_DUE" },
        });

        await createUserNotification({
          userId,
          type: "billing_payment_failed",
          title: "Payment failed",
          body: "We could not renew your subscription. Update payment details in billing portal.",
          linkUrl: "/settings",
        });
      }
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = invoice.customer ? String(invoice.customer) : null;

    if (customerId) {
      const userId = await resolveUserIdForCustomer(stripe, customerId);

      if (userId) {
        await db.subscription.updateMany({
          where: { userId },
          data: {
            status: "ACTIVE",
            plan: "PRO",
          },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}