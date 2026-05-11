import { randomBytes } from "crypto";

import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readSquads } from "@/server/queries/content";
import { createUserNotification } from "@/server/services/notifications";

const createSquadSchema = z.object({
  name: z.string().min(3).max(40),
  description: z.string().max(240).optional().or(z.literal("")),
  gameSlug: z.string().min(2).max(64),
  privacy: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]),
});

export async function GET() {
  const squads = await readSquads();
  return ok({ squads });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const rateLimit = await enforceRateLimit({
      key: `squad-create:${user.id}:${getClientIp(request)}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!rateLimit.ok) {
      return fail("RATE_LIMITED", "Too many squad creation attempts. Try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    const parsed = createSquadSchema.safeParse(body);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid squad payload.", 400);
    }

    const game = await db.game.findUnique({ where: { slug: parsed.data.gameSlug.toLowerCase() }, select: { id: true } });
    if (!game) {
      return fail("NOT_FOUND", "Unknown game.", 400);
    }

    const inviteCode = parsed.data.privacy === "PUBLIC" ? null : randomBytes(4).toString("hex").toUpperCase();

    const squad = await db.squad.create({
      data: {
        ownerId: user.id,
        gameId: game.id,
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        privacy: parsed.data.privacy,
        inviteCode,
        members: {
          create: {
            userId: user.id,
            role: "Owner",
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        name: true,
        privacy: true,
        inviteCode: true,
      },
    });

    await createUserNotification({
      userId: user.id,
      type: "GENERAL",
      title: "Squad created successfully",
      body: `${squad.name} is ready. Invite teammates and start building chemistry.`,
      href: "/squads",
    });

    return ok({ squad }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}