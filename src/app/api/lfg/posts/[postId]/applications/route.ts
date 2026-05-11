import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createUserNotification } from "@/server/services/notifications";

const applySchema = z.object({
  message: z.string().max(280).optional(),
});

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { postId } = await context.params;

    const rateLimit = await enforceRateLimit({
      key: `lfg-apply:${user.id}:${getClientIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    if (!rateLimit.ok) {
      return fail("RATE_LIMITED", "Too many join requests. Try again shortly.", 429);
    }

    const body = await request.json().catch(() => null);
    const parsed = applySchema.safeParse(body);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid application payload.", 400);
    }

    const post = await db.lfgPost.findUnique({
      where: { id: postId },
      select: {
        id: true,
        creatorId: true,
        status: true,
      },
    });

    if (!post || post.status !== "OPEN") {
      return fail("NOT_FOUND", "Post is not available.", 404);
    }

    if (post.creatorId === user.id) {
      return fail("FORBIDDEN", "You cannot apply to your own post.", 400);
    }

    const existing = await db.lfgApplication.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return fail("CONFLICT", "You already applied to this post.", 409);
    }

    const application = await db.lfgApplication.create({
      data: {
        postId,
        userId: user.id,
        message: parsed.data.message?.trim() || "Interested in joining your stack.",
        status: "PENDING",
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    await createUserNotification({
      userId: post.creatorId,
      type: "LFG_JOIN_REQUEST",
      title: "New join request on your LFG post",
      body: `${user.username} requested to join your stack.`,
      href: "/lfg",
    });

    await createUserNotification({
      userId: user.id,
      type: "GENERAL",
      title: "Join request sent",
      body: "Your application was submitted and is waiting for review.",
      href: "/lfg",
    });

    return ok({ application }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}