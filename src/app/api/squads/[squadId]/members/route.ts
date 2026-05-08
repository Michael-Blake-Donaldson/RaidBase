import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createUserNotification } from "@/server/services/notifications";

const joinSchema = z.object({
  inviteCode: z.string().max(32).optional(),
});

type RouteContext = {
  params: Promise<{
    squadId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { squadId } = await context.params;

  const rateLimit = await enforceRateLimit({
    key: `squad-join:${session.user.id}:${getClientIp(request)}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many join attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = joinSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid join payload." }, { status: 400 });
  }

  const squad = await db.squad.findUnique({
    where: { id: squadId },
    select: {
      id: true,
      ownerId: true,
      privacy: true,
      inviteCode: true,
    },
  });

  if (!squad) {
    return NextResponse.json({ error: "Squad not found." }, { status: 404 });
  }

  if (squad.ownerId === session.user.id) {
    return NextResponse.json({ error: "You already own this squad." }, { status: 400 });
  }

  const existingMembership = await db.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId,
        userId: session.user.id,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (existingMembership?.status === "ACTIVE") {
    return NextResponse.json({ error: "You are already a member of this squad." }, { status: 409 });
  }

  const inviteCode = parsed.data.inviteCode?.trim().toUpperCase() ?? "";
  const requiresInviteCode = squad.privacy !== "PUBLIC";
  if (requiresInviteCode && (!inviteCode || inviteCode !== squad.inviteCode)) {
    return NextResponse.json({ error: "Invite code is required for this squad." }, { status: 403 });
  }

  const member = existingMembership
    ? await db.squadMember.update({
        where: { squadId_userId: { squadId, userId: session.user.id } },
        data: { status: "ACTIVE", role: "Member" },
        select: { id: true, status: true },
      })
    : await db.squadMember.create({
        data: {
          squadId,
          userId: session.user.id,
          role: "Member",
          status: "ACTIVE",
        },
        select: { id: true, status: true },
      });

  await createUserNotification({
    userId: squad.ownerId,
    type: "squad_joined",
    title: "New squad member joined",
    body: `${session.user.username} joined your squad.`,
    linkUrl: "/squads",
  });

  await createUserNotification({
    userId: session.user.id,
    type: "squad_membership_confirmed",
    title: "You joined a squad",
    body: "Your membership is active. Coordinate your next session.",
    linkUrl: "/squads",
  });

  return NextResponse.json({ member }, { status: 201 });
}