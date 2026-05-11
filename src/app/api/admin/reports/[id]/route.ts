import { getServerSession } from "next-auth";
import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

const updateReportSchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "ACTION_TAKEN", "DISMISSED"]),
  details: z.string().max(800).optional(),
  actionType: z
    .enum(["WARN_USER", "HIDE_CONTENT", "DELETE_CONTENT", "SUSPEND_USER", "BAN_USER", "RESTORE_CONTENT", "DISMISS_REPORT"])
    .optional(),
  actionReason: z.string().max(300).optional(),
  enforceUserStatus: z.boolean().default(true),
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
    const report = await db.report.findUnique({
      where: { id },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        reportedUserId: true,
        reason: true,
      },
    });

    if (!report) {
      return fail("NOT_FOUND", "Report not found.", 404);
    }

    const updated = await db.report.update({
      where: { id },
      data: {
        status: parsed.data.status,
        details: parsed.data.details,
        moderatorId: session.user.id,
      },
    });

    const inferredActionType =
      parsed.data.actionType ??
      (parsed.data.status === "DISMISSED"
        ? "DISMISS_REPORT"
        : parsed.data.status === "IN_REVIEW"
          ? "WARN_USER"
          : parsed.data.status === "ACTION_TAKEN"
            ? "HIDE_CONTENT"
            : "RESTORE_CONTENT");

    const action = await db.moderationAction.create({
      data: {
        reportId: report.id,
        moderatorId: session.user.id,
        type: inferredActionType,
        targetType: report.targetType,
        targetId: report.targetId,
        reason: parsed.data.actionReason ?? parsed.data.details ?? report.reason,
      },
    });

    let enforcedUserStatus: "ACTIVE" | "SUSPENDED" | "BANNED" | null = null;

    if (parsed.data.enforceUserStatus && report.targetType === "USER") {
      if (inferredActionType === "SUSPEND_USER") {
        enforcedUserStatus = "SUSPENDED";
      }
      if (inferredActionType === "BAN_USER") {
        enforcedUserStatus = "BANNED";
      }
      if (inferredActionType === "RESTORE_CONTENT") {
        enforcedUserStatus = "ACTIVE";
      }

      if (enforcedUserStatus) {
        await db.user.updateMany({
          where: report.reportedUserId
            ? { id: report.reportedUserId }
            : {
                OR: [{ id: report.targetId }, { username: report.targetId.toLowerCase() }],
              },
          data: {
            status: enforcedUserStatus,
          },
        });
      }
    }

    return ok({ report: updated, action, enforcedUserStatus });
  } catch (error) {
    if ((error as { code?: string } | null)?.code === "P2025") {
      return fail("NOT_FOUND", "Report not found.", 404);
    }

    throw error;
  }
}