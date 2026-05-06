import { db } from "@/lib/db";

type SynergyInput = {
  scheduleMatch: number;
  rankCompatibility: number;
  roleComplement: number;
  regionLatencyFit: number;
  communicationMatch: number;
  mutualReputationFit: number;
};

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function computeSynergyScore(input: SynergyInput) {
  const score =
    input.scheduleMatch * 0.2 +
    input.rankCompatibility * 0.2 +
    input.roleComplement * 0.2 +
    input.regionLatencyFit * 0.1 +
    input.communicationMatch * 0.1 +
    input.mutualReputationFit * 0.2;

  return Math.round(clamp(score));
}

function rankToTier(rank: string) {
  const normalized = rank.toLowerCase();
  if (normalized.includes("radiant") || normalized.includes("immortal") || normalized.includes("mythic")) return 5;
  if (normalized.includes("ascendant") || normalized.includes("diamond")) return 4;
  if (normalized.includes("platinum") || normalized.includes("gold")) return 3;
  if (normalized.includes("silver") || normalized.includes("bronze")) return 2;
  return 1;
}

function scoreRankCompatibility(sourceRank: string, candidateRank: string) {
  const diff = Math.abs(rankToTier(sourceRank) - rankToTier(candidateRank));
  if (diff === 0) return 100;
  if (diff === 1) return 80;
  if (diff === 2) return 60;
  return 35;
}

function scoreRoleComplement(sourceRole: string, candidateRole: string) {
  if (sourceRole.toLowerCase() === candidateRole.toLowerCase()) {
    return 65;
  }

  return 90;
}

function scoreScheduleMatch(source: string | null, candidate: string | null) {
  if (!source || !candidate) return 55;
  if (source.toLowerCase() === candidate.toLowerCase()) return 95;

  const sourceTokens = source.toLowerCase().split(/\s+/);
  const candidateTokens = candidate.toLowerCase().split(/\s+/);
  const overlap = sourceTokens.filter((token) => candidateTokens.includes(token)).length;

  return clamp(40 + overlap * 10);
}

function scoreComms(source: string, candidate: string) {
  if (source.toLowerCase() === candidate.toLowerCase()) return 95;
  if (source.toLowerCase().includes("required") && candidate.toLowerCase().includes("required")) return 90;

  return 70;
}

function scoreReputation(avgScore: number) {
  return clamp(Math.round((avgScore / 5) * 100));
}

export async function getSynergyRecommendations(username: string, gameSlug?: string) {
  const sourceUser = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      profile: true,
      userGames: {
        include: {
          game: true,
        },
      },
      reputation: true,
    },
  });

  if (!sourceUser || !sourceUser.profile) {
    return [];
  }

  const sourceGame =
    sourceUser.userGames.find((entry) => entry.game.slug === gameSlug?.toLowerCase()) ?? sourceUser.userGames[0];

  if (!sourceGame) {
    return [];
  }

  const candidates = await db.user.findMany({
    where: {
      id: { not: sourceUser.id },
      status: "ACTIVE",
    },
    include: {
      profile: true,
      userGames: {
        where: {
          gameId: sourceGame.gameId,
        },
        include: {
          game: true,
        },
      },
      reputation: true,
    },
    take: 30,
  });

  const recommendations = candidates
    .filter((candidate) => candidate.profile && candidate.userGames.length > 0)
    .map((candidate) => {
      const candidateGame = candidate.userGames[0];
      const candidateReputation = candidate.reputation;
      const reputationAverage = candidateReputation
        ? (candidateReputation.reliabilityScore +
            candidateReputation.commsScore +
            candidateReputation.skillScore +
            candidateReputation.teamBehaviorScore) /
          4
        : 3.5;

      const score = computeSynergyScore({
        scheduleMatch: scoreScheduleMatch(sourceUser.profile?.schedule ?? null, candidate.profile?.schedule ?? null),
        rankCompatibility: scoreRankCompatibility(sourceGame.rank, candidateGame.rank),
        roleComplement: scoreRoleComplement(sourceGame.role, candidateGame.role),
        regionLatencyFit:
          sourceUser.profile?.region.toLowerCase() === candidate.profile?.region.toLowerCase() ? 95 : 70,
        communicationMatch: scoreComms(sourceUser.profile?.micPreference ?? "Preferred", candidate.profile?.micPreference ?? "Preferred"),
        mutualReputationFit: scoreReputation(reputationAverage),
      });

      return {
        username: candidate.username,
        displayName: candidate.profile?.displayName ?? candidate.username,
        rank: candidateGame.rank,
        role: candidateGame.role,
        region: candidate.profile?.region,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return recommendations;
}