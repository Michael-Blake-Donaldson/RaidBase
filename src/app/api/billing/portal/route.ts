import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/env";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  try {
    const user = await requireUser();

    const stripe = getStripe();
    const appBaseUrl = getAppBaseUrl();
    if (!stripe) {
      return fail("SERVICE_UNAVAILABLE", "Billing is not configured.", 503);
    }

    const subscription = await db.subscription.findUnique({ where: { userId: user.id } });
    if (!subscription?.stripeCustomerId) {
      return fail("NOT_FOUND", "No billing customer found. Start a Pro checkout first.", 404);
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appBaseUrl}/settings`,
    });

    return ok({ url: portal.url });
  } catch (error) {
    return handleRouteError(error);
  }
}