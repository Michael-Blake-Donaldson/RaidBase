import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const stripe = getStripe();
  const appBaseUrl = getAppBaseUrl();
  if (!stripe) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });
  if (!subscription?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing customer found. Start a Pro checkout first." },
      { status: 404 },
    );
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appBaseUrl}/settings`,
  });

  return NextResponse.json({ url: portal.url });
}