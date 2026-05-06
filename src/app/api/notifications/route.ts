import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { notificationItems, type NotificationItem } from "@/lib/site-data";

function inferCategory(type: string): NotificationItem["category"] {
  const normalized = type.toLowerCase();

  if (normalized.includes("invite") || normalized.includes("squad")) {
    return "invite";
  }

  if (normalized.includes("trust") || normalized.includes("reputation") || normalized.includes("review")) {
    return "trust";
  }

  if (normalized.includes("billing") || normalized.includes("subscription")) {
    return "billing";
  }

  return "content";
}

function inferPriority(type: string): NotificationItem["priority"] {
  const normalized = type.toLowerCase();

  if (normalized.includes("urgent") || normalized.includes("invite") || normalized.includes("security")) {
    return "High";
  }

  if (normalized.includes("billing") || normalized.includes("trust") || normalized.includes("report")) {
    return "Medium";
  }

  return "Low";
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({
      items: notificationItems.map((item) => ({ ...item, persisted: false })),
    });
  }

  const rows = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  });

  if (rows.length === 0) {
    return NextResponse.json({
      items: notificationItems.map((item) => ({ ...item, persisted: false })),
    });
  }

  const items: NotificationItem[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    detail: row.body,
    href: row.linkUrl ?? "/",
    category: inferCategory(row.type),
    priority: inferPriority(row.type),
    createdAt: row.createdAt.toISOString(),
    resolved: Boolean(row.readAt),
    persisted: true,
  }));

  return NextResponse.json({ items });
}
