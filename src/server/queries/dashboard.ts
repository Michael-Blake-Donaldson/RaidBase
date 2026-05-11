import type { ReportStatus, SeverityLevel } from "@prisma/client";

import { db } from "@/lib/db";
import type { ClipCard, LfgCard, PlayerCard, ReportCard, SquadCard } from "@/lib/site-data";

const percentile = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const jsonStringList = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value.filter((item): item is string => typeof item === "string");
};

const profilePlayType = (profile: unknown) => {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  const value = (profile as { preferredPlayType?: unknown }).preferredPlayType;
  return typeof value === "string" ? value : null;
};

const profilePlayTraits = (profile: unknown) => {
  if (!profile || typeof profile !== "object") {
    return [] as string[];
  }

  return jsonStringList((profile as { playstyleTraits?: unknown }).playstyleTraits);
};

const scorePlaystyleSimilarity = (
  viewerType: string | null,
  viewerTraits: string[],
  candidateType: string | null,
  candidateTraits: string[],
) => {
  const typeScore =
    viewerType && candidateType
      ? viewerType.toLowerCase() === candidateType.toLowerCase()
        ? 100
        : 72
      : 65;

  const viewerSet = new Set(viewerTraits.map((trait) => trait.toLowerCase()));
  const candidateSet = new Set(candidateTraits.map((trait) => trait.toLowerCase()));
  const overlap = [...viewerSet].filter((trait) => candidateSet.has(trait)).length;
  const maxTraits = Math.max(viewerSet.size, candidateSet.size, 1);
  const traitScore = Math.round((overlap / maxTraits) * 100);

  return percentile(typeScore * 0.65 + traitScore * 0.35);
};

const severityLabel: Record<SeverityLevel, ReportCard["severity"]> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const statusLabel: Record<ReportStatus, string> = {
  OPEN: "Queued for moderator action",
  IN_REVIEW: "Pending moderator review",
  ACTION_TAKEN: "Resolved by moderation",
  DISMISSED: "Dismissed by moderation",
};

export async function getRecommendedPlayersFromDb(viewerUsername?: string): Promise<PlayerCard[]> {
  const normalizedViewerUsername = viewerUsername?.trim().toLowerCase();

  const profiles = await db.profile.findMany({
    where: normalizedViewerUsername
      ? {
          user: {
            username: {
              not: normalizedViewerUsername,
            },
          },
        }
      : undefined,
    include: {
      user: {
        include: {
          userGames: {
            include: {
              game: true,
            },
          },
          reputation: true,
        },
      },
    },
    take: 6,
    orderBy: {
      updatedAt: "desc",
    },
  });

  const viewerProfile = normalizedViewerUsername
    ? await db.profile.findFirst({
        where: {
          user: {
            username: normalizedViewerUsername,
          },
        },
      })
    : null;

  const viewerPreferredType = profilePlayType(viewerProfile);
  const viewerTraits = profilePlayTraits(viewerProfile);

  return profiles.map((profile) => {
    const primaryGame = profile.user.userGames[0];
    const reputation = profile.user.reputation;
    const baseSynergy = reputation
      ? percentile(
          ((reputation.reliabilityScore + reputation.commsScore + reputation.skillScore + reputation.teamBehaviorScore) /
            20) *
            100,
        )
      : 0;

    const candidatePreferredType = profilePlayType(profile);
    const candidateTraits = profilePlayTraits(profile);
    const playstyleScore = scorePlaystyleSimilarity(
      viewerPreferredType,
      viewerTraits,
      candidatePreferredType,
      candidateTraits,
    );

    const synergy = viewerProfile ? percentile(baseSynergy * 0.72 + playstyleScore * 0.28) : baseSynergy;

    const publicBadges = reputation?.publicBadges ? jsonStringList(reputation.publicBadges) : [];

    return {
      username: profile.user.username,
      displayName: profile.displayName,
      rank: primaryGame?.rank ?? "Unranked",
      role: primaryGame?.role ?? "Flex",
      region: profile.region,
      mic: profile.micPreference,
      playType: candidatePreferredType ?? "Balanced",
      synergy,
      reputation: publicBadges.length > 0 ? publicBadges : ["Growing profile"],
      games: profile.user.userGames.map((entry) => entry.game.name),
      tagline: profile.bio ?? "Building squad chemistry one session at a time.",
      schedule: profile.schedule ?? "Schedule not set",
    };
  });
}

export async function getLfgPostsFromDb(): Promise<LfgCard[]> {
  const posts = await db.lfgPost.findMany({
    where: {
      status: "OPEN",
    },
    include: {
      game: true,
      applications: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    game: post.game.name,
    region: post.region,
    rank: [post.rankMin, post.rankMax].filter(Boolean).join(" - ") || "All ranks",
    roles: jsonStringList(post.rolesNeeded),
    schedule: post.schedule,
    tone: post.tone,
    micRequired: post.micRequired,
    openSpots: Math.max(0, 5 - post.applications.length),
  }));
}

export async function getClipsFromDb(): Promise<ClipCard[]> {
  const clips = await db.clip.findMany({
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      game: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  return clips.map((clip) => ({
    title: clip.title,
    player: clip.user.profile?.displayName ?? clip.user.username,
    game: clip.game?.name ?? "Cross-game",
    duration: "0:45",
    views: Intl.NumberFormat("en-US", { notation: "compact" }).format(clip.viewCount),
    mood: clip.featured ? "Featured" : "Community",
    url: clip.url,
    provider: clip.provider,
  }));
}

export async function getSquadsFromDb(): Promise<SquadCard[]> {
  const squads = await db.squad.findMany({
    include: {
      game: true,
      members: {
        where: {
          status: "ACTIVE",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 8,
  });

  return squads.map((squad) => ({
    id: squad.id,
    name: squad.name,
    game: squad.game.name,
    members: squad.members.length,
    openRoles: ["Flex"],
    synergy: percentile(68 + squad.members.length * 4),
    status: squad.privacy === "PUBLIC" ? "Open recruitment" : "Invite focused",
    activity: "Session and review activity synced",
    privacy: squad.privacy,
    inviteCodeRequired: Boolean(squad.inviteCode),
  }));
}

export async function getModerationQueueFromDb(): Promise<ReportCard[]> {
  const reports = await db.report.findMany({
    where: {
      status: {
        in: ["OPEN", "IN_REVIEW"],
      },
    },
    include: {
      reporter: {
        select: {
          username: true,
        },
      },
      moderator: {
        select: {
          username: true,
        },
      },
    },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  return reports.map((report) => ({
    id: report.id,
    subject: report.targetId,
    targetType: report.targetType,
    reason: report.reason,
    severity: severityLabel[report.severity],
    statusCode: report.status,
    status: statusLabel[report.status],
    evidence: report.details ?? "No additional evidence included.",
    reporter: report.reporter.username,
    moderator: report.moderator?.username ?? null,
    createdAt: report.createdAt.toISOString(),
  }));
}
