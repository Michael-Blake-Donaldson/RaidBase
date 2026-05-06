import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { notificationId } = await context.params;

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid notification action." }, { status: 400 });
  }

  const notification = await db.notification.findFirst({
    where: {
      id: notificationId,
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!notification) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }

  if (parsed.data.action === "dismiss") {
    await db.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return NextResponse.json({ ok: true, deleted: true });
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

    return NextResponse.json({ ok: true, resolved: false });
  }

  await db.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      readAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, resolved: true });
}
