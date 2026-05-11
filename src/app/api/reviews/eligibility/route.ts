import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { handleRouteError } from "@/lib/errors";

const querySchema = z.object({
  reviewedUsername: z.string().min(3).max(24),
  sessionId: z.string().min(5),
});

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);

    const parsed = querySchema.safeParse({
      reviewedUsername: url.searchParams.get("reviewedUsername"),
      sessionId: url.searchParams.get("sessionId"),
    });

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid eligibility query parameters.", 400);
    }

    const reviewed = await db.user.findUnique({
      where: {
        username: parsed.data.reviewedUsername.toLowerCase(),
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!reviewed) {
      return fail("NOT_FOUND", "Reviewed user not found.", 404);
    }

    if (reviewed.id === user.id) {
      return ok({
        eligible: false,
        reason: "SELF_REVIEW",
      });
    }

    const participantCount = await db.sessionParticipant.count({
      where: {
        sessionId: parsed.data.sessionId,
        userId: {
          in: [user.id, reviewed.id],
        },
      },
    });

    if (participantCount < 2) {
      return ok({
        eligible: false,
        reason: "NO_SHARED_VERIFIED_SESSION",
      });
    }

    const existingReview = await db.review.findFirst({
      where: {
        reviewerId: user.id,
        reviewedId: reviewed.id,
        sessionId: parsed.data.sessionId,
      },
      select: {
        id: true,
      },
    });

    if (existingReview) {
      return ok({
        eligible: false,
        reason: "ALREADY_REVIEWED",
      });
    }

    return ok({
      eligible: true,
      reviewedUser: {
        id: reviewed.id,
        username: reviewed.username,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
