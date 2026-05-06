import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { getAppBaseUrl, getStripeEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const stripe = getStripe();
  const { proPriceId } = getStripeEnv();
  const appBaseUrl = getAppBaseUrl();

  if (!stripe || !proPriceId) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });

  let customerId = subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: {
        userId: session.user.id,
      },
    });
    customerId = customer.id;

    await db.subscription.upsert({
      where: { userId: session.user.id },
      update: { stripeCustomerId: customerId },
      create: {
        userId: session.user.id,
        stripeCustomerId: customerId,
        plan: "FREE",
        status: "ACTIVE",
      },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: proPriceId, quantity: 1 }],
    success_url: `${appBaseUrl}/settings?billing=success`,
    cancel_url: `${appBaseUrl}/settings?billing=cancelled`,
  });

  return NextResponse.json({ url: checkout.url });
}