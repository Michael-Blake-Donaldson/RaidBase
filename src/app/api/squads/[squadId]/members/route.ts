import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createUserNotification } from "@/server/services/notifications";

const joinSchema = z.object({
  inviteCode: z.string().max(32).optional(),
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
      key: `squad-join:${user.id}:${getClientIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    if (!rateLimit.ok) {
      return fail("RATE_LIMITED", "Too many join attempts. Try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    const parsed = joinSchema.safeParse(body);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid join payload.", 400);
    }

    const squad = await db.squad.findUnique({
      where: { id: squadId },
      select: {
        id: true,
        ownerId: true,
        privacy: true,
        inviteCode: true,
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
      select: {
        id: true,
        status: true,
      },
    });

    if (existingMembership?.status === "ACTIVE") {
      return fail("CONFLICT", "You are already a member of this squad.", 409);
    }

    const inviteCode = parsed.data.inviteCode?.trim().toUpperCase() ?? "";
    const requiresInviteCode = squad.privacy !== "PUBLIC";
    if (requiresInviteCode && (!inviteCode || inviteCode !== squad.inviteCode)) {
      return fail("FORBIDDEN", "Invite code is required for this squad.", 403);
    }

    const member = existingMembership
      ? await db.squadMember.update({
          where: { squadId_userId: { squadId, userId: user.id } },
          data: { status: "ACTIVE", role: "Member" },
          select: { id: true, status: true },
        })
      : await db.squadMember.create({
          data: {
            squadId,
            userId: user.id,
            role: "Member",
            status: "ACTIVE",
          },
          select: { id: true, status: true },
        });

    await createUserNotification({
      userId: squad.ownerId,
      type: "SQUAD_REQUEST_ACCEPTED",
      title: "New squad member joined",
      body: `${user.username} joined your squad.`,
      href: "/squads",
    });

    await createUserNotification({
      userId: user.id,
      type: "SQUAD_REQUEST_ACCEPTED",
      title: "You joined a squad",
      body: "Your membership is active. Coordinate your next session.",
      href: "/squads",
    });

    return ok({ member }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}