import { PrismaClient, SubscriptionPlan, SubscriptionStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = await bcrypt.hash("RaidbaseDemo!2026", 12);

  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.sessionParticipant.deleteMany();
  await prisma.session.deleteMany();
  await prisma.lfgApplication.deleteMany();
  await prisma.lfgPost.deleteMany();
  await prisma.squadMember.deleteMany();
  await prisma.squad.deleteMany();
  await prisma.clip.deleteMany();
  await prisma.report.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.reputationAggregate.deleteMany();
  await prisma.userGame.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();

  const games = await Promise.all([
    prisma.game.create({ data: { name: "Valorant", slug: "valorant", genre: "Tactical Shooter" } }),
    prisma.game.create({ data: { name: "CS2", slug: "cs2", genre: "Tactical Shooter" } }),
    prisma.game.create({ data: { name: "Destiny 2", slug: "destiny-2", genre: "Raid" } }),
    prisma.game.create({ data: { name: "Apex Legends", slug: "apex-legends", genre: "Battle Royale" } }),
    prisma.game.create({ data: { name: "World of Warcraft", slug: "world-of-warcraft", genre: "MMO" } }),
  ]);

  const ghost = await prisma.user.create({
    data: {
      email: "ghosttrace@raidbase.gg",
      username: "ghosttrace",
      passwordHash: defaultPassword,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          displayName: "Ghost Trace",
          region: "NA Central",
          timezone: "America/Chicago",
          micPreference: "Required",
          bio: "Runs calm mid-round calls and stays composed late in ranked grinds.",
          schedule: "Weeknights 7PM-11PM CT",
        },
      },
      userGames: {
        createMany: {
          data: [
            { gameId: games[0].id, rank: "Immortal 2", role: "Initiator / IGL" },
            { gameId: games[1].id, rank: "Faceit 10", role: "Rifler" },
          ],
        },
      },
      reputation: {
        create: {
          reliabilityScore: 4.9,
          commsScore: 4.8,
          skillScore: 4.7,
          teamBehaviorScore: 4.9,
          reviewCount: 12,
          uniqueReviewers: 7,
          publicBadges: ["Reliable", "Shotcaller", "Great Comms"],
        },
      },
      subscription: {
        create: {
          plan: SubscriptionPlan.PRO,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
        },
      },
    },
  });

  const ember = await prisma.user.create({
    data: {
      email: "emberraid@raidbase.gg",
      username: "emberraid",
      passwordHash: defaultPassword,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          displayName: "Ember Raid",
          region: "NA East",
          timezone: "America/New_York",
          micPreference: "Preferred",
          bio: "Builds clean progression groups with notes and accountability.",
          schedule: "Tue/Thu/Sun 8PM-12AM ET",
        },
      },
      userGames: {
        createMany: {
          data: [
            { gameId: games[2].id, rank: "Mythic Raid Lead", role: "Support / Strategist" },
            { gameId: games[4].id, rank: "AOTC", role: "Raid Planner" },
          ],
        },
      },
      reputation: {
        create: {
          reliabilityScore: 4.8,
          commsScore: 4.6,
          skillScore: 4.7,
          teamBehaviorScore: 4.9,
          reviewCount: 9,
          uniqueReviewers: 6,
          publicBadges: ["Mentor", "Chill", "Prepared"],
        },
      },
      subscription: {
        create: {
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
      },
    },
  });

  const vector = await prisma.user.create({
    data: {
      email: "vectorhush@raidbase.gg",
      username: "vectorhush",
      passwordHash: defaultPassword,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          displayName: "Vector Hush",
          region: "EU West",
          timezone: "Europe/London",
          micPreference: "Required",
          bio: "High-pressure opener who still rotates and reviews mistakes.",
          schedule: "Daily 6PM-10PM GMT",
        },
      },
      userGames: {
        createMany: {
          data: [
            { gameId: games[3].id, rank: "Diamond 1", role: "Entry / Flex" },
            { gameId: games[0].id, rank: "Ascendant", role: "Duelist" },
          ],
        },
      },
      reputation: {
        create: {
          reliabilityScore: 4.5,
          commsScore: 4.4,
          skillScore: 4.6,
          teamBehaviorScore: 4.7,
          reviewCount: 7,
          uniqueReviewers: 5,
          publicBadges: ["Reliable", "Fast Learner", "No Tilt"],
        },
      },
      subscription: {
        create: {
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
      },
    },
  });

  const nightCircuit = await prisma.squad.create({
    data: {
      ownerId: ghost.id,
      gameId: games[0].id,
      name: "Night Circuit",
      privacy: "INVITE_ONLY",
      description: "Disciplined ranked stack",
    },
  });

  await prisma.squadMember.createMany({
    data: [
      { squadId: nightCircuit.id, userId: ghost.id, role: "IGL" },
      { squadId: nightCircuit.id, userId: ember.id, role: "Support" },
      { squadId: nightCircuit.id, userId: vector.id, role: "Entry" },
    ],
  });

  await prisma.lfgPost.createMany({
    data: [
      {
        creatorId: ghost.id,
        gameId: games[0].id,
        title: "Immortal stack for disciplined ranked push",
        mode: "Ranked",
        rankMin: "Ascendant 3",
        rankMax: "Radiant",
        region: "NA Central",
        rolesNeeded: ["Controller", "Sentinel"],
        micRequired: true,
        tone: "Competitive",
        schedule: "Tonight 8PM-1AM CT",
      },
      {
        creatorId: ember.id,
        gameId: games[2].id,
        title: "Heroic raid prep with guides and logs",
        mode: "Raid",
        rankMin: "AOTC",
        rankMax: "Mythic",
        region: "NA East",
        rolesNeeded: ["Healer", "Ranged DPS"],
        micRequired: true,
        tone: "Structured",
        schedule: "Tue/Thu 8PM-11PM ET",
      },
    ],
  });

  await prisma.clip.createMany({
    data: [
      {
        userId: ghost.id,
        gameId: games[0].id,
        url: "https://youtube.com/watch?v=raidbase1",
        provider: "YouTube",
        title: "4v2 retake with layered utility",
        featured: true,
        viewCount: 18400,
      },
      {
        userId: ember.id,
        gameId: games[2].id,
        url: "https://youtube.com/watch?v=raidbase2",
        provider: "YouTube",
        title: "Mythic callout breakdown and clean finish",
        featured: true,
        viewCount: 9100,
      },
      {
        userId: vector.id,
        gameId: games[3].id,
        url: "https://youtube.com/watch?v=raidbase3",
        provider: "YouTube",
        title: "Final ring reset with instant armor swap",
        featured: false,
        viewCount: 13700,
      },
    ],
  });

  await prisma.report.createMany({
    data: [
      {
        reporterId: ember.id,
        targetType: "USER",
        targetId: "rapidflame",
        reason: "Session toxicity spike",
        details: "5 negative reviews across 3 verified sessions in 48 hours",
        severity: "HIGH",
        status: "OPEN",
      },
      {
        reporterId: ghost.id,
        targetType: "USER",
        targetId: "boostlink777",
        reason: "Potential impersonation",
        details: "Username similarity and reused clip thumbnails",
        severity: "MEDIUM",
        status: "IN_REVIEW",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
