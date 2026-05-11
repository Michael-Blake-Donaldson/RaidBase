import { ok, fail } from "@/lib/api-response";
import { db } from "@/lib/db";
import { handleRouteError } from "@/lib/errors";
import { buildTrustSummary } from "@/server/services/reputation";

type Params = {
  params: Promise<{ username: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { username } = await params;

    const user = await db.user.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        reputation: true,
      },
    });

    if (!user || !user.reputation) {
      return fail("NOT_FOUND", "Reputation not found.", 404);
    }

    const trustSummary = buildTrustSummary({
      reliabilityScore: user.reputation.reliabilityScore,
      commsScore: user.reputation.commsScore,
      skillScore: user.reputation.skillScore,
      teamBehaviorScore: user.reputation.teamBehaviorScore,
      toxicityRisk: user.reputation.toxicityRisk,
      reviewCount: user.reputation.reviewCount,
      uniqueReviewers: user.reputation.uniqueReviewers,
      publicBadges: user.reputation.publicBadges,
    });

    return ok({
      reputation: {
        reliabilityScore: user.reputation.reliabilityScore,
        commsScore: user.reputation.commsScore,
        skillScore: user.reputation.skillScore,
        teamBehaviorScore: user.reputation.teamBehaviorScore,
        toxicityRisk: user.reputation.toxicityRisk,
        reviewCount: user.reputation.reviewCount,
        uniqueReviewers: user.reputation.uniqueReviewers,
        trust: trustSummary,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}