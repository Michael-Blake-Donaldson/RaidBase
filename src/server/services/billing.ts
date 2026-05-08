import type Stripe from "stripe";

import { db } from "@/lib/db";

export function mapSubscriptionStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVE" as const;
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
      return "PAST_DUE" as const;
    case "canceled":
      return "CANCELED" as const;
    default:
      return "INACTIVE" as const;
  }
}

export function planFromStatus(status: ReturnType<typeof mapSubscriptionStatus>) {
  return status === "ACTIVE" ? ("PRO" as const) : ("FREE" as const);
}

export async function syncSubscriptionFromStripeSubscription(input: {
  userId: string;
  stripeCustomerId: string;
  subscription: Stripe.Subscription;
}) {
  const mappedStatus = mapSubscriptionStatus(input.subscription.status);

  return db.subscription.upsert({
    where: {
      userId: input.userId,
    },
    update: {
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.subscription.id,
      status: mappedStatus,
      plan: planFromStatus(mappedStatus),
      currentPeriodEnd: input.subscription.items.data[0]?.current_period_end
        ? new Date(input.subscription.items.data[0].current_period_end * 1000)
        : null,
    },
    create: {
      userId: input.userId,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.subscription.id,
      status: mappedStatus,
      plan: planFromStatus(mappedStatus),
      currentPeriodEnd: input.subscription.items.data[0]?.current_period_end
        ? new Date(input.subscription.items.data[0].current_period_end * 1000)
        : null,
    },
  });
}
