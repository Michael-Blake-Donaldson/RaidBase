import bcrypt from "bcryptjs";
import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit({
    key: `reset-password:${getClientIp(request)}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    return fail("RATE_LIMITED", "Too many attempts. Please wait before trying again.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Token and password are required.", 400);
  }

  const { token, password } = parsed.data;

  const record = await db.passwordResetToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, status: true } } },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return fail("NOT_FOUND", "This reset link is invalid or has expired.", 400);
  }

  if (record.user.status === "BANNED" || record.user.status === "DELETED") {
    return fail("FORBIDDEN", "This account cannot be accessed.", 403);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.$transaction([
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    db.user.update({
      where: { id: record.user.id },
      data: {
        passwordHash,
        // Activate account if it was unverified (password reset implies email access)
        ...(record.user.status === "EMAIL_UNVERIFIED"
          ? { status: "ACTIVE", emailVerifiedAt: new Date() }
          : {}),
      },
    }),
  ]);

  return ok({ reset: true });
}
