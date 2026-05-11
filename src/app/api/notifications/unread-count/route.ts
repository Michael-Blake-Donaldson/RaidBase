import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { ok } from "@/lib/api-response";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return ok({ count: 0, unreadOnly: true });
  }

  const count = await db.notification.count({
    where: { userId: session.user.id, readAt: null },
  });

  return ok({ count, unreadOnly: true });
}
