import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { ok } from "@/lib/api-response";
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

export async function GET() {
  const session = await getServerSession(authOptions);

  // Anonymous users get demo/seed notifications so the tray isn't empty
  if (!session?.user?.id) {
    const items: NotificationItem[] = notificationItems.map((item) => ({
      ...item,
      persisted: false,
    }));
    return ok({ items });
  }

  // Authenticated users get their real notifications only
  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
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
  return ok({ items });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ success: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } }, { status: 401 });
  }

  const body = await request.json().catch(() => ({})) as { id?: string; markAll?: boolean };

  if (body.markAll) {
    await db.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return ok({ markedAll: true });
  }

  if (body.id) {
    const notification = await db.notification.findFirst({
      where: { id: body.id, userId: session.user.id },
    });
    if (!notification) {
      return Response.json({ success: false, error: { code: "NOT_FOUND", message: "Notification not found." } }, { status: 404 });
    }
    if (!notification.readAt) {
      await db.notification.update({
        where: { id: body.id },
        data: { readAt: new Date() },
      });
    }
    return ok({ marked: true });
  }

  return Response.json({ success: false, error: { code: "BAD_REQUEST", message: "Provide id or markAll." } }, { status: 400 });
}
