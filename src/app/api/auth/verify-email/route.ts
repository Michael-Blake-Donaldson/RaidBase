import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return fail("VALIDATION_ERROR", "Verification token is required.", 400);
  }

  const record = await db.emailVerificationToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, status: true } } },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return fail("NOT_FOUND", "This verification link is invalid or has expired.", 400);
  }

  await db.$transaction([
    db.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    db.user.update({
      where: { id: record.user.id },
      data: {
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    }),
  ]);

  return ok({ verified: true });
}
