import { getServerSession } from "next-auth";

import { ok, fail } from "@/lib/api-response";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return fail("FORBIDDEN", "Forbidden", 403);
  }

  const reports = await db.report.findMany({
    include: {
      actions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          moderator: {
            select: {
              username: true,
            },
          },
        },
      },
    },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return ok({ reports });
}