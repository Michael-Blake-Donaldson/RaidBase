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

const severityLabel: Record<SeverityLevel, ReportCard["severity"]> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const statusLabel: Record<ReportStatus, string> = {
  OPEN: "Queued for moderator action",
  IN_REVIEW: "Pending moderator review",
  RESOLVED: "Resolved by moderation",
  DISMISSED: "Dismissed by moderation",
};

export async function getRecommendedPlayersFromDb(): Promise<PlayerCard[]> {
  const profiles = await db.profile.findMany({
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

  return profiles.map((profile) => {
    const primaryGame = profile.user.userGames[0];
    const reputation = profile.user.reputation;
    const synergy = reputation
      ? percentile(
          ((reputation.reliabilityScore + reputation.commsScore + reputation.skillScore + reputation.teamBehaviorScore) /
            20) *
            100,
        )
      : 0;

    const publicBadges = reputation?.publicBadges ? jsonStringList(reputation.publicBadges) : [];

    return {
      username: profile.user.username,
      displayName: profile.displayName,
      rank: primaryGame?.rank ?? "Unranked",
      role: primaryGame?.role ?? "Flex",
      region: profile.region,
      mic: profile.micPreference,
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
    inviteCodeRequired: squad.privacy !== "PUBLIC",
  }));
}

export async function getModerationQueueFromDb(): Promise<ReportCard[]> {
  const reports = await db.report.findMany({
    where: {
      status: {
        in: ["OPEN", "IN_REVIEW"],
      },
    },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: 12,
  });

  return reports.map((report) => ({
    subject: report.targetId,
    reason: report.reason,
    severity: severityLabel[report.severity],
    status: statusLabel[report.status],
    evidence: report.details ?? "No additional evidence included.",
  }));
}
