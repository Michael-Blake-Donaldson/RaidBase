import { db } from "@/lib/db";

type CreateUserNotificationInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  linkUrl?: string | null;
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
      linkUrl: input.linkUrl?.trim() || null,
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
      linkUrl: entry.linkUrl?.trim() || null,
    })),
  });
}
