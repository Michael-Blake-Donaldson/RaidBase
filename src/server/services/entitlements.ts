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
    return { plan: "FREE", status: "INACTIVE", entitlements: freeEntitlements };
  }

  const isPro = subscription.plan === "PRO" && subscription.status === "ACTIVE";

  return {
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    entitlements: isPro ? proEntitlements : freeEntitlements,
  };
}