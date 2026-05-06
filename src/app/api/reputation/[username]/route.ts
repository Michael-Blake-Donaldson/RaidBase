import { NextResponse } from "next/server";

import { db } from "@/lib/db";

type Params = {
  params: Promise<{ username: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { username } = await params;

  const user = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      reputation: true,
    },
  });

  if (!user || !user.reputation) {
    return NextResponse.json({ error: "Reputation not found." }, { status: 404 });
  }

  const canDisplay = user.reputation.uniqueReviewers >= 3 || user.reputation.reviewCount >= 5;

  return NextResponse.json({
    reputation: {
      reliabilityScore: user.reputation.reliabilityScore,
      commsScore: user.reputation.commsScore,
      skillScore: user.reputation.skillScore,
      teamBehaviorScore: user.reputation.teamBehaviorScore,
      toxicityRisk: user.reputation.toxicityRisk,
      reviewCount: user.reputation.reviewCount,
      uniqueReviewers: user.reputation.uniqueReviewers,
      publicBadges: canDisplay ? user.reputation.publicBadges ?? [] : [],
      isPubliclyVisible: canDisplay,
    },
  });
}