import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    appId: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { appId } = await context.params;

    const application = await db.lfgApplication.findUnique({
      where: { id: appId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            creatorId: true,
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

    if (!application) {
      return fail("NOT_FOUND", "Application not found.", 404);
    }

    // Only the applicant or post creator can view
    if (application.userId !== user.id && application.post.creatorId !== user.id) {
      return fail("FORBIDDEN", "You cannot view this application.", 403);
    }

    return ok({ application });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { appId } = await context.params;

    const application = await db.lfgApplication.findUnique({
      where: { id: appId },
      select: {
        userId: true,
        status: true,
      },
    });

    if (!application) {
      return fail("NOT_FOUND", "Application not found.", 404);
    }

    if (application.userId !== user.id) {
      return fail("FORBIDDEN", "You can only withdraw your own applications.", 403);
    }

    if (application.status !== "PENDING") {
      return fail("CONFLICT", "You can only withdraw pending applications.", 409);
    }

    await db.lfgApplication.delete({
      where: { id: appId },
    });

    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
