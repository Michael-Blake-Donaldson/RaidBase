import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { createUserNotification } from "@/server/services/notifications";

type RouteContext = {
  params: Promise<{
    appId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { appId } = await context.params;

    const application = await db.lfgApplication.findUnique({
      where: { id: appId },
      include: {
        post: true,
        user: true,
      },
    });

    if (!application) {
      return fail("NOT_FOUND", "Application not found.", 404);
    }

    if (application.post.creatorId !== user.id) {
      return fail("FORBIDDEN", "You can only accept applications on your own posts.", 403);
    }

    if (application.status !== "PENDING") {
      return fail("CONFLICT", "This application has already been processed.", 409);
    }

    const updated = await db.lfgApplication.update({
      where: { id: appId },
      data: { status: "APPROVED" },
    });

    await createUserNotification({
      userId: application.userId,
      type: "LFG_REQUEST_ACCEPTED",
      title: "Your join request was accepted!",
      body: `Your application for "${application.post.title}" was approved. Check your messages for next steps.`,
      href: "/lfg",
    });

    return ok({ application: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
