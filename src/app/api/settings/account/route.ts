import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";

const deleteAccountSchema = z.object({
  username: z.string().min(1).max(64),
  confirmationText: z.literal("DELETE"),
  password: z.string().min(8).max(128),
});

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await enforceRateLimit({
    key: `account-delete:${clientIp}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many account deletion attempts. Please try again later." },
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
    return NextResponse.json({ error: "Invalid account deletion payload." }, { status: 400 });
  }

  const { username, password } = parsed.data;

  if (session.user.username !== username.trim()) {
    return NextResponse.json({ error: "Confirmation username does not match your account." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  if (!user.passwordHash) {
    return NextResponse.json({ error: "Password confirmation is unavailable for this account." }, { status: 409 });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return NextResponse.json({ error: "Password verification failed." }, { status: 403 });
  }

  await db.user.delete({ where: { id: user.id } });

  return NextResponse.json({ ok: true });
}
