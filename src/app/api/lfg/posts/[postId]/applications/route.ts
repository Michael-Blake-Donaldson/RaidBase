import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createUserNotification } from "@/server/services/notifications";

const applySchema = z.object({
  message: z.string().max(280).optional(),
});

type RouteContext = {
  params: Promise<{
    postId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { postId } = await context.params;

  const rateLimit = enforceRateLimit({
    key: `lfg-apply:${session.user.id}:${getClientIp(request)}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many join requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = applySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application payload." }, { status: 400 });
  }

  const post = await db.lfgPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      creatorId: true,
      status: true,
    },
  });

  if (!post || post.status !== "OPEN") {
    return NextResponse.json({ error: "Post is not available." }, { status: 404 });
  }

  if (post.creatorId === session.user.id) {
    return NextResponse.json({ error: "You cannot apply to your own post." }, { status: 400 });
  }

  const existing = await db.lfgApplication.findUnique({
    where: {
      postId_userId: {
        postId,
        userId: session.user.id,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ error: "You already applied to this post." }, { status: 409 });
  }

  const application = await db.lfgApplication.create({
    data: {
      postId,
      userId: session.user.id,
      message: parsed.data.message?.trim() || "Interested in joining your stack.",
      status: "PENDING",
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  });

  await createUserNotification({
    userId: post.creatorId,
    type: "lfg_application_received",
    title: "New join request on your LFG post",
    body: `${session.user.username} requested to join your stack.`,
    linkUrl: "/lfg",
  });

  await createUserNotification({
    userId: session.user.id,
    type: "lfg_application_submitted",
    title: "Join request sent",
    body: "Your application was submitted and is waiting for review.",
    linkUrl: "/lfg",
  });

  return NextResponse.json({ application }, { status: 201 });
}