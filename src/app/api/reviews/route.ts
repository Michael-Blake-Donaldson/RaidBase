import { getServerSession } from "next-auth";
import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createUserNotifications } from "@/server/services/notifications";
import { recomputeReputationAggregate } from "@/server/services/reputation";

const reviewSchema = z.object({
  reviewedUsername: z.string().min(3).max(24),
  sessionId: z.string().min(5),
  reliability: z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5),
  skillFit: z.number().int().min(1).max(5),
  teamBehavior: z.number().int().min(1).max(5),
  repeatTeammate: z.boolean(),
  tags: z.array(z.string().min(2).max(32)).max(8).optional(),
  comment: z.string().max(400).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "HIDDEN"]).default("PUBLIC"),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return fail("UNAUTHORIZED", "Authentication required.", 401);
  }

  const rateLimit = await enforceRateLimit({
    key: `review:${session.user.id}:${getClientIp(request)}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    const resp = fail("RATE_LIMITED", "Too many review attempts.", 429);
    resp.headers.set("Retry-After", String(Math.ceil(rateLimit.retryAfterMs / 1000)));
    return resp;
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid review payload.", 400);
  }

  const reviewed = await db.user.findUnique({
    where: {
      username: parsed.data.reviewedUsername.toLowerCase(),
    },
    select: { id: true, username: true },
  });

  if (!reviewed) {
    return fail("NOT_FOUND", "Reviewed user not found.", 404);
  }

  if (reviewed.id === session.user.id) {
    return fail("BAD_REQUEST", "You cannot review yourself.", 400);
  }

  const participantCount = await db.sessionParticipant.count({
    where: {
      sessionId: parsed.data.sessionId,
      userId: {
        in: [session.user.id, reviewed.id],
      },
    },
  });

  if (participantCount < 2) {
    return fail("FORBIDDEN", "Review requires a shared verified session between reviewer and reviewed user.", 400);
  }

  try {
    const review = await db.review.create({
      data: {
        reviewerId: session.user.id,
        reviewedId: reviewed.id,
        sessionId: parsed.data.sessionId,
        reliability: parsed.data.reliability,
        communication: parsed.data.communication,
        skillFit: parsed.data.skillFit,
        teamBehavior: parsed.data.teamBehavior,
        repeatTeammate: parsed.data.repeatTeammate,
        tags: parsed.data.tags ?? [],
        comment: parsed.data.comment,
        visibility: parsed.data.visibility,
      },
    });

    await recomputeReputationAggregate(reviewed.id);

    await createUserNotifications([
      {
        userId: reviewed.id,
        type: "REVIEW_RECEIVED",
        title: "New session review received",
        body: `${session.user.username} submitted a review for your recent session.`,
        href: `/profile/${reviewed.username}`,
      },
      {
        userId: session.user.id,
        type: "GENERAL",
        title: "Review submitted",
        body: "Your review has been recorded and trust metrics were refreshed.",
        href: "/settings",
      },
    ]);

    return ok({ review }, { status: 201 });
  } catch {
    return fail("CONFLICT", "Duplicate review for this session is not allowed.", 409);
  }
}