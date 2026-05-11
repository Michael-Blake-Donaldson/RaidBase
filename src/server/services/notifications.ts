import type { NotificationType } from "@prisma/client";
import { db } from "@/lib/db";

type CreateUserNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string | null;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createUserNotification(input: CreateUserNotificationInput) {
  const title = input.title.trim();
  const body = input.body.trim();

  if (!title || !body) {
    return null;
  }

  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title,
      body,
      href: input.href?.trim() ?? null,
      actorId: input.actorId ?? null,
      metadata: input.metadata ? (input.metadata as object) : undefined,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
}

export async function createUserNotifications(inputs: CreateUserNotificationInput[]) {
  const valid = inputs.filter((entry) => entry.title.trim() && entry.body.trim());

  if (valid.length === 0) {
    return;
  }

  await db.notification.createMany({
    data: valid.map((entry) => ({
      userId: entry.userId,
      type: entry.type,
      title: entry.title.trim(),
      body: entry.body.trim(),
      href: entry.href?.trim() ?? null,
      actorId: entry.actorId ?? null,
      metadata: entry.metadata ? (entry.metadata as object) : undefined,
    })),
  });
}
