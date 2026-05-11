import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createUserNotification } from "@/server/services/notifications";

const inviteSchema = z.object({
  usernameOrId: z.string().min(1).max(64),
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
      key: `squad-invite:${user.id}:${getClientIp(request)}`,
      limit: 30,
      windowMs: 60_000,
    });

    if (!rateLimit.ok) {
      return fail("RATE_LIMITED", "Too many invites. Try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid invite payload.", 400);
    }

    const squad = await db.squad.findUnique({
      where: { id: squadId },
      select: {
        id: true,
        ownerId: true,
        name: true,
      },
    });

    if (!squad) {
      return fail("NOT_FOUND", "Squad not found.", 404);
    }

    if (squad.ownerId !== user.id) {
      return fail("FORBIDDEN", "Only the squad owner can send invites.", 403);
    }

    const invitedUser = await db.user.findFirst({
      where: {
        OR: [{ username: parsed.data.usernameOrId }, { id: parsed.data.usernameOrId }],
      },
      select: { id: true, username: true },
    });

    if (!invitedUser) {
      return fail("NOT_FOUND", "User not found.", 404);
    }

    if (invitedUser.id === user.id) {
      return fail("BAD_REQUEST", "You cannot invite yourself.", 400);
    }

    const existingMembership = await db.squadMember.findUnique({
      where: {
        squadId_userId: {
          squadId,
          userId: invitedUser.id,
        },
      },
      select: { id: true, status: true },
    });

    if (existingMembership?.status === "ACTIVE") {
      return fail("CONFLICT", "This user is already a member of the squad.", 409);
    }

    if (existingMembership?.status === "INVITED") {
      return fail("CONFLICT", "This user already has a pending invite to the squad.", 409);
    }

    // Create or update the squad member with INVITED status
    const member = await db.squadMember.upsert({
      where: {
        squadId_userId: {
          squadId,
          userId: invitedUser.id,
        },
      },
      update: {
        status: "INVITED",
      },
      create: {
        squadId,
        userId: invitedUser.id,
        role: "Member",
        status: "INVITED",
      },
      select: { id: true, status: true },
    });

    await createUserNotification({
      userId: invitedUser.id,
      type: "SQUAD_INVITE",
      title: `${user.username} invited you to ${squad.name}`,
      body: "Accept the invite to join their squad and start playing together.",
      href: "/squads",
    });

    return ok({ member }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
