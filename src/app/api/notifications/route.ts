import { NextResponse } from "next/server";
import { notificationItems, type NotificationItem } from "@/lib/site-data";

export async function GET() {
  const items: NotificationItem[] = notificationItems.map((item) => ({
    ...item,
    persisted: false,
  }));

  return NextResponse.json({ items });
}
