import {
  featuredClips,
  lfgPosts,
  moderationQueue,
  recommendedPlayers,
  squads,
} from "@/lib/site-data";
import {
  getClipsFromDb,
  getLfgPostsFromDb,
  getModerationQueueFromDb,
  getRecommendedPlayersFromDb,
  getSquadsFromDb,
} from "@/server/queries/dashboard";

const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

export async function readPlayers(viewerUsername?: string) {
  if (isProductionBuild) {
    return recommendedPlayers;
  }

  try {
    const data = await getRecommendedPlayersFromDb(viewerUsername);
    return data.length > 0 ? data : recommendedPlayers;
  } catch {
    return recommendedPlayers;
  }
}

export async function readLfgPosts(limit: number = 50, offset: number = 0) {
  if (isProductionBuild) {
    return lfgPosts;
  }

  try {
    const data = await getLfgPostsFromDb(limit, offset);
    return data.length > 0 ? data : lfgPosts;
  } catch {
    return lfgPosts;
  }
}

export async function readClips() {
  if (isProductionBuild) {
    return featuredClips;
  }

  try {
    const data = await getClipsFromDb();
    return data.length > 0 ? data : featuredClips;
  } catch {
    return featuredClips;
  }
}

export async function readSquads() {
  if (isProductionBuild) {
    return squads;
  }

  try {
    const data = await getSquadsFromDb();
    return data.length > 0 ? data : squads;
  } catch {
    return squads;
  }
}

export async function readModerationQueue() {
  if (isProductionBuild) {
    return moderationQueue;
  }

  try {
    const data = await getModerationQueueFromDb();
    return data.length > 0 ? data : moderationQueue;
  } catch {
    return moderationQueue;
  }
}
