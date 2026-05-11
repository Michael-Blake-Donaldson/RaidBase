import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { createUserNotification } from "@/server/services/notifications";

type RouteContext = {
  params: Promise<{
    reqId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { reqId } = await context.params;

    const joinRequest = await db.squadJoinRequest.findUnique({
      where: { id: reqId },
      include: {
        squad: {
          select: {
            id: true,
            ownerId: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!joinRequest) {
      return fail("NOT_FOUND", "Join request not found.", 404);
    }

    if (joinRequest.squad.ownerId !== user.id) {
      return fail("FORBIDDEN", "Only the squad owner can decline join requests.", 403);
    }

    if (joinRequest.status !== "pending") {
      return fail("CONFLICT", "This request has already been processed.", 409);
    }

    const updated = await db.squadJoinRequest.update({
      where: { id: reqId },
      data: { status: "declined" },
    });

    await createUserNotification({
      userId: joinRequest.user.id,
      type: "GENERAL",
      title: "Squad join request declined",
      body: `Your request to join ${joinRequest.squad.name} was declined. Keep looking for your squad!`,
      href: "/squads",
    });

    return ok({ joinRequest: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
