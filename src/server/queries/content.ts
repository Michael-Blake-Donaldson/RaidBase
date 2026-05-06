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

export async function readPlayers() {
  try {
    const data = await getRecommendedPlayersFromDb();
    return data.length > 0 ? data : recommendedPlayers;
  } catch {
    return recommendedPlayers;
  }
}

export async function readLfgPosts() {
  try {
    const data = await getLfgPostsFromDb();
    return data.length > 0 ? data : lfgPosts;
  } catch {
    return lfgPosts;
  }
}

export async function readClips() {
  try {
    const data = await getClipsFromDb();
    return data.length > 0 ? data : featuredClips;
  } catch {
    return featuredClips;
  }
}

export async function readSquads() {
  try {
    const data = await getSquadsFromDb();
    return data.length > 0 ? data : squads;
  } catch {
    return squads;
  }
}

export async function readModerationQueue() {
  try {
    const data = await getModerationQueueFromDb();
    return data.length > 0 ? data : moderationQueue;
  } catch {
    return moderationQueue;
  }
}
