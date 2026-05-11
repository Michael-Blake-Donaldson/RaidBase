import { z } from "zod";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { type NotificationItem, notificationItems } from "@/lib/site-data";

function dbNotificationToItem(n: {
  id: string;
  title: string;
  body: string;
  href: string | null;
  type: string;
  createdAt: Date;
  readAt: Date | null;
}): NotificationItem {
  const categoryMap: Record<string, NotificationItem["category"]> = {
    LFG_JOIN_REQUEST: "invite",
    LFG_REQUEST_ACCEPTED: "invite",
    LFG_REQUEST_DECLINED: "invite",
    SQUAD_INVITE: "invite",
    SQUAD_JOIN_REQUEST: "invite",
    SQUAD_REQUEST_ACCEPTED: "invite",
    SQUAD_MEMBER_REMOVED: "invite",
    REVIEW_RECEIVED: "trust",
    CLIP_REPORTED: "content",
    MODERATION_ACTION: "content",
    ACCOUNT_SECURITY: "billing",
    GENERAL: "content",
  };
  const priorityMap: Record<string, NotificationItem["priority"]> = {
    LFG_JOIN_REQUEST: "High",
    SQUAD_INVITE: "High",
    SQUAD_JOIN_REQUEST: "High",
    MODERATION_ACTION: "High",
    LFG_REQUEST_ACCEPTED: "Medium",
    LFG_REQUEST_DECLINED: "Medium",
    SQUAD_REQUEST_ACCEPTED: "Medium",
    SQUAD_MEMBER_REMOVED: "Medium",
    REVIEW_RECEIVED: "Medium",
    CLIP_REPORTED: "Medium",
    ACCOUNT_SECURITY: "Medium",
    GENERAL: "Low",
  };

  return {
    id: n.id,
    title: n.title,
    detail: n.body,
    href: n.href ?? "/",
    category: categoryMap[n.type] ?? "content",
    priority: priorityMap[n.type] ?? "Low",
    createdAt: n.createdAt.toISOString(),
    resolved: n.readAt !== null,
    persisted: true,
  };
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Anonymous users get demo/seed notifications so the tray isn't empty
    if (!session?.user?.id) {
      const items: NotificationItem[] = notificationItems.map((item) => ({
        ...item,
        persisted: false,
      }));
      return ok({ items, total: items.length, unread: 0 });
    }

    // Parse query parameters manually
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? undefined;
    const limit = Math.min(Math.max(1, parseInt(url.searchParams.get("limit") ?? "50")), 100);
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0"));
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";

    // Build where clause
    const where: any = { userId: session.user.id };
    if (type) {
      where.type = type;
    }
    if (unreadOnly) {
      where.readAt = null;
    }

    // Fetch total count for pagination
    const total = await db.notification.count({ where });

    // Authenticated users get their real notifications
    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        body: true,
        href: true,
        type: true,
        createdAt: true,
        readAt: true,
      },
    });

    const items = notifications.map(dbNotificationToItem);

    // Count unread
    const unread = await db.notification.count({
      where: { userId: session.user.id, readAt: null },
    });

    return ok({ items, total, unread, limit, offset });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();

    const body = await request.json().catch(() => null);
    
    if (!body) {
      return fail("VALIDATION_ERROR", "Invalid payload.", 400);
    }

    if (body.markAll) {
      await db.notification.updateMany({
        where: { userId: user.id, readAt: null },
        data: { readAt: new Date() },
      });
      return ok({ markedAll: true });
    }

    if (body.id) {
      const notification = await db.notification.findFirst({
        where: { id: body.id, userId: user.id },
      });

      if (!notification) {
        return fail("NOT_FOUND", "Notification not found.", 404);
      }

      if (!notification.readAt) {
        await db.notification.update({
          where: { id: body.id },
          data: { readAt: new Date() },
        });
      }

      return ok({ marked: true });
    }

    return fail("BAD_REQUEST", "Provide id or markAll.", 400);
  } catch (error) {
    return handleRouteError(error);
  }
}
