import { db } from "@/lib/db";

export type Entitlements = {
  profileThemes: boolean;
  extraClipSlots: boolean;
  advancedFilters: boolean;
  squadAnalytics: boolean;
  boostedDiscovery: boolean;
};

const freeEntitlements: Entitlements = {
  profileThemes: false,
  extraClipSlots: false,
  advancedFilters: false,
  squadAnalytics: false,
  boostedDiscovery: false,
};

const proEntitlements: Entitlements = {
  profileThemes: true,
  extraClipSlots: true,
  advancedFilters: true,
  squadAnalytics: true,
  boostedDiscovery: true,
};

export async function getUserEntitlements(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: {
      plan: true,
      status: true,
      currentPeriodEnd: true,
    },
  });

  if (!subscription) {
    return {
      plan: "FREE",
      status: "INACTIVE",
      clipLimit: 3,
      isPro: false,
      entitlements: freeEntitlements,
    };
  }

  const periodValid = subscription.currentPeriodEnd ? subscription.currentPeriodEnd.getTime() > Date.now() : true;
  const isPro = subscription.plan === "PRO" && subscription.status === "ACTIVE" && periodValid;

  return {
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    clipLimit: isPro ? 10 : 3,
    isPro,
    entitlements: isPro ? proEntitlements : freeEntitlements,
  };
}