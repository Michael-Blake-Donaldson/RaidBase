import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    clipId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { clipId } = await context.params;

    const clip = await db.clip.findUnique({
      where: { id: clipId },
      select: {
        id: true,
        userId: true,
        status: true,
        visibility: true,
      },
    });

    if (!clip || clip.status === "deleted") {
      return fail("NOT_FOUND", "Clip not found.", 404);
    }

    if (clip.visibility === "private" && clip.userId !== user.id) {
      return fail("FORBIDDEN", "You cannot like a private clip from another user.", 403);
    }

    // TODO: Add ClipLike junction table for proper tracking
    // For MVP, we'll track likes on the client side and just acknowledge the action
    return ok({
      clipId,
      liked: true,
      message: "Like recorded (client-side tracking for MVP)",
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
