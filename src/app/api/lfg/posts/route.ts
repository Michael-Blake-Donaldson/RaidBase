import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readLfgPosts } from "@/server/queries/content";
import { createUserNotification } from "@/server/services/notifications";

const createLfgSchema = z.object({
  gameSlug: z.string().min(2).max(64),
  title: z.string().min(8).max(120),
  mode: z.string().min(2).max(40),
  rankMin: z.string().min(2).max(40).optional(),
  rankMax: z.string().min(2).max(40).optional(),
  region: z.string().min(2).max(64),
  rolesNeeded: z.array(z.string().min(2).max(40)).min(1).max(6),
  micRequired: z.boolean(),
  tone: z.string().min(2).max(40),
  schedule: z.string().min(2).max(80),
});

export async function GET() {
  const posts = await readLfgPosts();
  return ok({ posts });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const rateLimit = await enforceRateLimit({
      key: `lfg-create:${user.id}:${getClientIp(request)}`,
      limit: 15,
      windowMs: 60_000,
    });

    if (!rateLimit.ok) {
      return fail("RATE_LIMITED", "Too many post attempts. Try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    const parsed = createLfgSchema.safeParse(body);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid LFG payload.", 400);
    }

    const game = await db.game.findUnique({ where: { slug: parsed.data.gameSlug.toLowerCase() } });
    if (!game) {
      return fail("NOT_FOUND", "Unknown game.", 400);
    }

    const created = await db.lfgPost.create({
      data: {
        creatorId: user.id,
        gameId: game.id,
        title: parsed.data.title,
        mode: parsed.data.mode,
        rankMin: parsed.data.rankMin,
        rankMax: parsed.data.rankMax,
        region: parsed.data.region,
        rolesNeeded: parsed.data.rolesNeeded,
        micRequired: parsed.data.micRequired,
        tone: parsed.data.tone,
        schedule: parsed.data.schedule,
        status: "OPEN",
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8),
      },
    });

    await createUserNotification({
      userId: user.id,
      type: "GENERAL",
      title: "Your LFG post is live",
      body: `Your post "${created.title}" is now visible in the board.`,
      href: "/lfg",
    });

    return ok({ post: created }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}