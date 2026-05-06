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
  getViewerProfileContext,
} from "@/server/queries/dashboard";

export async function readPlayers(viewerUserId?: string | null) {
  try {
    const data = await getRecommendedPlayersFromDb(viewerUserId);
    return data.length > 0 ? data : recommendedPlayers;
  } catch {
    return recommendedPlayers;
  }
}

export async function readLfgPosts(viewerUserId?: string | null) {
  try {
    const data = await getLfgPostsFromDb(viewerUserId);
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

export async function readViewerContext(viewerUserId?: string | null) {
  try {
    return await getViewerProfileContext(viewerUserId);
  } catch {
    return null;
  }
}
