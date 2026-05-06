import { db } from "@/lib/db";

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}

export async function recomputeReputationAggregate(userId: string) {
  const reviews = await db.review.findMany({
    where: {
      reviewedId: userId,
      visibility: {
        in: ["PUBLIC", "PRIVATE"],
      },
    },
    select: {
      reviewerId: true,
      reliability: true,
      communication: true,
      skillFit: true,
      teamBehavior: true,
      repeatTeammate: true,
    },
  });

  if (reviews.length === 0) {
    return db.reputationAggregate.upsert({
      where: { userId },
      update: {
        reliabilityScore: 0,
        commsScore: 0,
        skillScore: 0,
        teamBehaviorScore: 0,
        toxicityRisk: 0,
        reviewCount: 0,
        uniqueReviewers: 0,
        publicBadges: [],
      },
      create: {
        userId,
        reliabilityScore: 0,
        commsScore: 0,
        skillScore: 0,
        teamBehaviorScore: 0,
        toxicityRisk: 0,
        reviewCount: 0,
        uniqueReviewers: 0,
        publicBadges: [],
      },
    });
  }

  const reviewCount = reviews.length;
  const uniqueReviewers = new Set(reviews.map((review) => review.reviewerId)).size;

  const reliabilityAvg = reviews.reduce((sum, review) => sum + review.reliability, 0) / reviewCount;
  const communicationAvg = reviews.reduce((sum, review) => sum + review.communication, 0) / reviewCount;
  const skillAvg = reviews.reduce((sum, review) => sum + review.skillFit, 0) / reviewCount;
  const behaviorAvg = reviews.reduce((sum, review) => sum + review.teamBehavior, 0) / reviewCount;
  const repeatRate = reviews.filter((review) => review.repeatTeammate).length / reviewCount;

  const badges: string[] = [];
  const canShowBadges = uniqueReviewers >= 3 || reviewCount >= 5;

  if (canShowBadges) {
    if (reliabilityAvg >= 4.2) badges.push("Reliable");
    if (communicationAvg >= 4.2) badges.push("Great Comms");
    if (behaviorAvg >= 4.2) badges.push("Chill");
    if (skillAvg >= 4.2) badges.push("Skilled");
    if (repeatRate >= 0.5) badges.push("Repeat Queue");
    if (behaviorAvg <= 2.5) badges.push("Frequent Quitter");
  }

  const toxicityRisk = Math.max(0, roundToTenth(((5 - behaviorAvg) / 5) * 100));

  return db.reputationAggregate.upsert({
    where: { userId },
    update: {
      reliabilityScore: roundToTenth(reliabilityAvg),
      commsScore: roundToTenth(communicationAvg),
      skillScore: roundToTenth(skillAvg),
      teamBehaviorScore: roundToTenth(behaviorAvg),
      toxicityRisk,
      reviewCount,
      uniqueReviewers,
      publicBadges: badges,
    },
    create: {
      userId,
      reliabilityScore: roundToTenth(reliabilityAvg),
      commsScore: roundToTenth(communicationAvg),
      skillScore: roundToTenth(skillAvg),
      teamBehaviorScore: roundToTenth(behaviorAvg),
      toxicityRisk,
      reviewCount,
      uniqueReviewers,
      publicBadges: badges,
    },
  });
}