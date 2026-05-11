import { randomBytes } from "crypto";
import { z } from "zod";

import { ok } from "@/lib/api-response";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { sendPasswordReset } from "@/server/services/email";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  // Always return 200 to prevent email enumeration
  const genericSuccess = ok({ sent: true });

  const rateLimit = await enforceRateLimit({
    key: `forgot-password:${getClientIp(request)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    // Return generic success to prevent enumeration even when rate limited
    return genericSuccess;
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotSchema.safeParse(body);

  if (!parsed.success) {
    return genericSuccess;
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, status: true },
  });

  // If user not found or suspended/banned, silently return success
  if (!user || user.status === "BANNED" || user.status === "DELETED") {
    return genericSuccess;
  }

  // Invalidate any existing unused reset tokens for this user
  await db.passwordResetToken.updateMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  const resetToken = randomBytes(32).toString("hex");
  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // Fire-and-forget
  sendPasswordReset({ to: user.email, token: resetToken }).catch((err) => {
    console.error("[forgot-password] Failed to send reset email:", err);
  });

  return genericSuccess;
}
