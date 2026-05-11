import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createUserNotification } from "@/server/services/notifications";

const joinRequestSchema = z.object({
  message: z.string().max(280).optional(),
});

type RouteContext = {
  params: Promise<{
    squadId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { squadId } = await context.params;

    const rateLimit = await enforceRateLimit({
      key: `squad-join-request:${user.id}:${getClientIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    if (!rateLimit.ok) {
      return fail("RATE_LIMITED", "Too many join requests. Try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    const parsed = joinRequestSchema.safeParse(body);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid request payload.", 400);
    }

    const squad = await db.squad.findUnique({
      where: { id: squadId },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

    if (!squad) {
      return fail("NOT_FOUND", "Squad not found.", 404);
    }

    if (squad.ownerId === user.id) {
      return fail("BAD_REQUEST", "You already own this squad.", 400);
    }

    const existingMembership = await db.squadMember.findUnique({
      where: {
        squadId_userId: {
          squadId,
          userId: user.id,
        },
      },
      select: { id: true, status: true },
    });

    if (existingMembership?.status === "ACTIVE") {
      return fail("CONFLICT", "You are already a member of this squad.", 409);
    }

    const existingRequest = await db.squadJoinRequest.findUnique({
      where: {
        squadId_userId: {
          squadId,
          userId: user.id,
        },
      },
      select: { id: true, status: true },
    });

    if (existingRequest?.status === "pending") {
      return fail("CONFLICT", "You already have a pending join request for this squad.", 409);
    }

    const joinRequest = await db.squadJoinRequest.create({
      data: {
        squadId,
        userId: user.id,
        message: parsed.data.message?.trim() || "Interested in joining your squad.",
        status: "pending",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    await createUserNotification({
      userId: squad.ownerId,
      type: "SQUAD_JOIN_REQUEST",
      title: "New squad join request",
      body: `${user.username} requested to join ${squad.name}.`,
      href: "/squads",
    });

    await createUserNotification({
      userId: user.id,
      type: "GENERAL",
      title: "Join request sent",
      body: `Your request to join ${squad.name} is pending approval.`,
      href: "/squads",
    });

    return ok({ joinRequest }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
