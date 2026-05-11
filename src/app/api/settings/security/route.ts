import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return fail("UNAUTHORIZED", "Authentication required.", 401);
  }

  const rateLimit = await enforceRateLimit({
    key: `change-password:${session.user.id}:${getClientIp(request)}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    return fail("RATE_LIMITED", "Too many password change attempts. Please try again later.", 429);
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid password change payload.", 400);
  }

  const { currentPassword, newPassword } = parsed.data;

  if (currentPassword === newPassword) {
    return fail("VALIDATION_ERROR", "New password must differ from your current password.", 400);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    return fail("CONFLICT", "Password change is not available for this account.", 409);
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    return fail("FORBIDDEN", "Current password is incorrect.", 403);
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return ok({ changed: true });
}
