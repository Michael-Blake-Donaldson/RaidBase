import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";

const updateSchema = z.object({
  action: z.enum(["accept", "dismiss", "open"]),
});

type RouteContext = {
  params: Promise<{
    notificationId: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { notificationId } = await context.params;

    const body = await request.json().catch(() => null);
    const parsed = updateSchema.safeParse(body);
    
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid notification action.", 400);
    }

    const notification = await db.notification.findFirst({
      where: {
        id: notificationId,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      return fail("NOT_FOUND", "Notification not found.", 404);
    }

    if (parsed.data.action === "dismiss") {
      await db.notification.delete({
        where: {
          id: notificationId,
        },
      });

      return ok({ deleted: true });
    }

    if (parsed.data.action === "open") {
      await db.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          readAt: null,
        },
      });

      return ok({ resolved: false });
    }

    await db.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        readAt: new Date(),
      },
    });

    return ok({ resolved: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
