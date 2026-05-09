import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { emitObservabilityEvent, getRequestId } from "@/lib/observability";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const deleteAccountSchema = z.object({
  username: z.string().min(1).max(64),
  confirmationText: z.literal("DELETE"),
  password: z.string().min(8).max(128),
});

export async function DELETE(request: Request) {
  const requestId = await getRequestId();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required.", requestId }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await enforceRateLimit({
    key: `account-delete:${clientIp}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    await emitObservabilityEvent({
      event: "account_delete_rate_limited",
      level: "warn",
      requestId,
      payload: {
        userId: session.user.id,
        username: session.user.username,
      },
    });

    return NextResponse.json(
      { error: "Too many account deletion attempts. Please try again later.", requestId },
      {
        status: 429,
        headers: {
          "retry-after": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      },
    );
  }

  const payload = await request.json().catch(() => null);
  const parsed = deleteAccountSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid account deletion payload.", requestId }, { status: 400 });
  }

  const { username, password } = parsed.data;

  if (session.user.username !== username.trim()) {
    return NextResponse.json({ error: "Confirmation username does not match your account.", requestId }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Account not found.", requestId }, { status: 404 });
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: "Password confirmation is unavailable for this account.", requestId }, { status: 409 });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    await emitObservabilityEvent({
      event: "account_delete_password_failed",
      level: "warn",
      requestId,
      payload: {
        userId: session.user.id,
        username: session.user.username,
      },
    });

    return NextResponse.json({ error: "Password verification failed.", requestId }, { status: 403 });
  }

  await db.user.delete({ where: { id: user.id } });

  await emitObservabilityEvent({
    event: "account_deleted",
    level: "warn",
    requestId,
    payload: {
      userId: user.id,
      username: session.user.username,
    },
  });

  return NextResponse.json({ ok: true, requestId });
}
