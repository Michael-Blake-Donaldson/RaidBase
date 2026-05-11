import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { createUserNotification } from "@/server/services/notifications";

const updateMemberSchema = z.object({
  role: z.string().min(1).max(40).optional(),
});

type RouteContext = {
  params: Promise<{
    squadId: string;
    userId: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { squadId, userId } = await context.params;

    const body = await request.json().catch(() => null);
    const parsed = updateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid update payload.", 400);
    }

    const squad = await db.squad.findUnique({
      where: { id: squadId },
      select: { ownerId: true },
    });

    if (!squad) {
      return fail("NOT_FOUND", "Squad not found.", 404);
    }

    if (squad.ownerId !== user.id) {
      return fail("FORBIDDEN", "Only the squad owner can update member roles.", 403);
    }

    if (userId === user.id) {
      return fail("BAD_REQUEST", "You cannot change your own role.", 400);
    }

    const member = await db.squadMember.findUnique({
      where: {
        squadId_userId: {
          squadId,
          userId,
        },
      },
      select: {
        id: true,
        userId: true,
        role: true,
      },
    });

    if (!member) {
      return fail("NOT_FOUND", "Member not found.", 404);
    }

    const updated = await db.squadMember.update({
      where: {
        squadId_userId: {
          squadId,
          userId,
        },
      },
      data: {
        role: parsed.data.role || member.role,
      },
      select: { id: true, role: true, status: true },
    });

    await createUserNotification({
      userId,
      type: "GENERAL",
      title: "Your squad role was updated",
      body: `You are now a ${updated.role} in the squad.`,
      href: "/squads",
    });

    return ok({ member: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { squadId, userId } = await context.params;

    const squad = await db.squad.findUnique({
      where: { id: squadId },
      select: { ownerId: true, name: true },
    });

    if (!squad) {
      return fail("NOT_FOUND", "Squad not found.", 404);
    }

    if (squad.ownerId !== user.id && userId !== user.id) {
      return fail("FORBIDDEN", "Only the squad owner or the member can remove membership.", 403);
    }

    if (squad.ownerId === userId) {
      return fail("BAD_REQUEST", "The squad owner cannot be removed.", 400);
    }

    const member = await db.squadMember.findUnique({
      where: {
        squadId_userId: {
          squadId,
          userId,
        },
      },
      select: { id: true },
    });

    if (!member) {
      return fail("NOT_FOUND", "Member not found.", 404);
    }

    await db.squadMember.delete({
      where: {
        squadId_userId: {
          squadId,
          userId,
        },
      },
    });

    await createUserNotification({
      userId,
      type: "SQUAD_MEMBER_REMOVED",
      title: "You were removed from a squad",
      body: `You are no longer a member of ${squad.name}.`,
      href: "/squads",
    });

    return ok({ removed: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
