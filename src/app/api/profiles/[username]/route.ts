import { NextResponse } from "next/server";

import { db } from "@/lib/db";

type Params = {
  params: Promise<{ username: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { username } = await params;

  const user = await db.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
    include: {
      profile: true,
      userGames: {
        include: {
          game: true,
        },
      },
      clips: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      reputation: true,
      createdLfgPosts: {
        where: {
          status: "OPEN",
        },
      },
    },
  });

  if (!user || !user.profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      username: user.username,
      displayName: user.profile.displayName,
      bio: user.profile.bio,
      region: user.profile.region,
      timezone: user.profile.timezone,
      micPreference: user.profile.micPreference,
      schedule: user.profile.schedule,
      games: user.userGames.map((entry) => ({
        name: entry.game.name,
        rank: entry.rank,
        role: entry.role,
      })),
      reputation: user.reputation,
      openLfgPosts: user.createdLfgPosts.length,
      clips: user.clips,
    },
  });
}