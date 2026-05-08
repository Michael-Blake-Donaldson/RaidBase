import { db } from "@/lib/db";

function roundToTenth(value: number) {
  return Math.round(value * 10) / 10;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const MIN_PUBLIC_REVIEWERS = 3;
export const MIN_PUBLIC_REVIEWS = 5;

export function canDisplayPublicBadges(reviewCount: number, uniqueReviewers: number) {
  return uniqueReviewers >= MIN_PUBLIC_REVIEWERS || reviewCount >= MIN_PUBLIC_REVIEWS;
}

type TrustSummaryInput = {
  reliabilityScore: number;
  commsScore: number;
  skillScore: number;
  teamBehaviorScore: number;
  toxicityRisk: number;
  reviewCount: number;
  uniqueReviewers: number;
  publicBadges: unknown;
};

const scoreLabel = (score: number) => {
  if (score >= 4.6) return "Elite";
  if (score >= 4.2) return "Strong";
  if (score >= 3.7) return "Solid";
  if (score >= 3.2) return "Developing";
  return "Needs work";
};

const toStringList = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
};

export function buildTrustSummary(input: TrustSummaryInput) {
  const visibility = canDisplayPublicBadges(input.reviewCount, input.uniqueReviewers);
  const trustScoreRaw =
    (input.reliabilityScore * 0.3 + input.commsScore * 0.25 + input.skillScore * 0.25 + input.teamBehaviorScore * 0.2) *
    20 -
    input.toxicityRisk * 0.15;
  const trustScore = Math.round(clamp(trustScoreRaw, 0, 100));

  let tier = "Developing";
  if (input.toxicityRisk >= 50) {
    tier = "Under review";
  } else if (trustScore >= 90) {
    tier = "Elite teammate";
  } else if (trustScore >= 80) {
    tier = "High confidence";
  } else if (trustScore >= 70) {
    tier = "Trusted";
  }

  const categoryScores = {
    reliability: {
      score: input.reliabilityScore,
      label: scoreLabel(input.reliabilityScore),
    },
    communication: {
      score: input.commsScore,
      label: scoreLabel(input.commsScore),
    },
    skillFit: {
      score: input.skillScore,
      label: scoreLabel(input.skillScore),
    },
    teamBehavior: {
      score: input.teamBehaviorScore,
      label: scoreLabel(input.teamBehaviorScore),
    },
  };

  const highlights = Object.entries(categoryScores)
    .filter(([, value]) => value.score >= 4.2)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 2)
    .map(([key]) => key);

  const concerns = [
    ...(input.teamBehaviorScore <= 3 ? ["teamBehavior"] : []),
    ...(input.commsScore <= 3 ? ["communication"] : []),
    ...(input.toxicityRisk >= 40 ? ["toxicityRisk"] : []),
  ];

  return {
    trustScore,
    tier,
    isPubliclyVisible: visibility,
    categoryScores,
    highlights,
    concerns,
    reviewThreshold: {
      minReviewers: MIN_PUBLIC_REVIEWERS,
      minReviews: MIN_PUBLIC_REVIEWS,
      reviewCount: input.reviewCount,
      uniqueReviewers: input.uniqueReviewers,
    },
    publicBadges: visibility ? toStringList(input.publicBadges) : [],
  };
}

function generatePublicBadges(input: {
  reliabilityAvg: number;
  communicationAvg: number;
  skillAvg: number;
  behaviorAvg: number;
  repeatRate: number;
  reviewCount: number;
  uniqueReviewers: number;
  toxicityRisk: number;
}) {
  const badges: string[] = [];

  if (input.reliabilityAvg >= 4.4) badges.push("Reliable");
  if (input.communicationAvg >= 4.3) badges.push("Great Comms");
  if (input.skillAvg >= 4.3) badges.push("Skilled");
  if (input.behaviorAvg >= 4.3) badges.push("Positive Teammate");
  if (input.repeatRate >= 0.5 && input.behaviorAvg >= 4) badges.push("Repeat Queue");
  if (input.uniqueReviewers >= 5 && input.reviewCount >= 10) badges.push("Verified Veteran");
  if (input.toxicityRisk >= 45) badges.push("Needs Review");

  return badges.slice(0, 5);
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
  const toxicityRisk = roundToTenth(clamp(((5 - behaviorAvg) / 5) * 100 + (repeatRate < 0.2 ? 8 : 0), 0, 100));
  const badges = canDisplayPublicBadges(reviewCount, uniqueReviewers)
    ? generatePublicBadges({
        reliabilityAvg,
        communicationAvg,
        skillAvg,
        behaviorAvg,
        repeatRate,
        reviewCount,
        uniqueReviewers,
        toxicityRisk,
      })
    : [];

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