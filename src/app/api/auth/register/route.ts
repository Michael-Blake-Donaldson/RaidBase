import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { db } from "@/lib/db";
import { validateUsername } from "@/lib/auth/username";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sendEmailVerification } from "@/server/services/email";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z.string().min(8).max(128),
  region: z.string().min(2).max(64),
  timezone: z.string().min(2).max(64),
});

export async function POST(request: Request) {
  const rateLimit = await enforceRateLimit({
    key: `register:${getClientIp(request)}`,
    limit: 8,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    const resp = fail("RATE_LIMITED", "Too many registration attempts. Try again shortly.", 429);
    resp.headers.set("Retry-After", String(Math.ceil(rateLimit.retryAfterMs / 1000)));
    return resp;
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid registration payload.", 400);
  }

  const usernameCheck = validateUsername(parsed.data.username);
  if (!usernameCheck.ok) {
    return fail("VALIDATION_ERROR", usernameCheck.reason, 400);
  }

  const existing = await db.user.findFirst({
    where: {
      OR: [{ email: parsed.data.email }, { username: usernameCheck.normalized }],
    },
    select: { id: true },
  });

  if (existing) {
    return fail("CONFLICT", "Email or username already in use.", 409);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const verificationToken = randomBytes(32).toString("hex");

  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      username: usernameCheck.normalized,
      passwordHash,
      status: "EMAIL_UNVERIFIED",
      profile: {
        create: {
          displayName: usernameCheck.normalized,
          region: parsed.data.region,
          timezone: parsed.data.timezone,
          micPreference: "Preferred",
          bio: "New player profile.",
          preferredPlayType: "Balanced",
          playstyleTraits: ["Developing identity", "Flexible role coverage"],
        },
      },
      subscription: {
        create: {
          plan: "FREE",
          status: "ACTIVE",
        },
      },
      emailVerifTokens: {
        create: {
          token: verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      },
    },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  // Fire-and-forget — registration should not fail if email is unavailable
  sendEmailVerification({ to: user.email, token: verificationToken }).catch((err) => {
    console.error("[register] Failed to send verification email:", err);
  });

  return ok({ user }, { status: 201 });
}