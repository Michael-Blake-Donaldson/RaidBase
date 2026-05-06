import { randomBytes } from "crypto";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readSquads } from "@/server/queries/content";

const createSquadSchema = z.object({
  name: z.string().min(3).max(40),
  description: z.string().max(240).optional().or(z.literal("")),
  gameSlug: z.string().min(2).max(64),
  privacy: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]),
});

export async function GET() {
  const squads = await readSquads();
  return NextResponse.json({ squads });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const rateLimit = enforceRateLimit({
    key: `squad-create:${session.user.id}:${getClientIp(request)}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many squad creation attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createSquadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid squad payload." }, { status: 400 });
  }

  const game = await db.game.findUnique({ where: { slug: parsed.data.gameSlug.toLowerCase() }, select: { id: true } });
  if (!game) {
    return NextResponse.json({ error: "Unknown game." }, { status: 400 });
  }

  const inviteCode = parsed.data.privacy === "PUBLIC" ? null : randomBytes(4).toString("hex").toUpperCase();

  const squad = await db.squad.create({
    data: {
      ownerId: session.user.id,
      gameId: game.id,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim() || null,
      privacy: parsed.data.privacy,
      inviteCode,
      members: {
        create: {
          userId: session.user.id,
          role: "Owner",
          status: "ACTIVE",
        },
      },
    },
    select: {
      id: true,
      name: true,
      privacy: true,
      inviteCode: true,
    },
  });

  return NextResponse.json({ squad }, { status: 201 });
}