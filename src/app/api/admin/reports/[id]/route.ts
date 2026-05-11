import { getServerSession } from "next-auth";
import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

const updateReportSchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "ACTION_TAKEN", "DISMISSED"]),
  details: z.string().max(800).optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return fail("FORBIDDEN", "Forbidden", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateReportSchema.safeParse(body);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid report update payload.", 400);
  }

  const { id } = await params;

  try {
    const updated = await db.report.update({
      where: { id },
      data: {
        status: parsed.data.status,
        details: parsed.data.details,
        moderatorId: session.user.id,
      },
    });

    return ok({ report: updated });
  } catch (error) {
    if ((error as { code?: string } | null)?.code === "P2025") {
      return fail("NOT_FOUND", "Report not found.", 404);
    }

    throw error;
  }
}