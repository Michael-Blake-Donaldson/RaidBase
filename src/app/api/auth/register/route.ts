import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { validateUsername } from "@/lib/auth/username";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(128),
  region: z.string().min(2).max(64),
  timezone: z.string().min(2).max(64),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
  }

  const usernameCheck = validateUsername(parsed.data.username);
  if (!usernameCheck.ok) {
    return NextResponse.json({ error: usernameCheck.reason }, { status: 400 });
  }

  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: usernameCheck.normalized }],
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: "Email or username already in use." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      username: usernameCheck.normalized,
      passwordHash,
      profile: {
        create: {
          displayName: usernameCheck.normalized,
          region: parsed.data.region,
          timezone: parsed.data.timezone,
          micPreference: "Preferred",
          bio: "New player profile.",
        },
      },
      subscription: {
        create: {
          plan: "FREE",
          status: "ACTIVE",
        },
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}