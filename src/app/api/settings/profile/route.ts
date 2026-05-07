import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(40),
  bio: z.string().max(400).optional().or(z.literal("")),
  region: z.string().min(2).max(64),
  timezone: z.string().min(2).max(64),
  language: z.string().max(64).optional().or(z.literal("")),
  micPreference: z.string().min(2).max(64),
  schedule: z.string().max(160).optional().or(z.literal("")),
  preferredPlayType: z.string().max(64).optional().or(z.literal("")),
  playstyleTraits: z.array(z.string().max(64)).max(8).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      displayName: true,
      bio: true,
      region: true,
      timezone: true,
      language: true,
      micPreference: true,
      schedule: true,
      preferredPlayType: true,
      playstyleTraits: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }

  const data = parsed.data;

  const profile = await db.profile.update({
    where: { userId: session.user.id },
    data: {
      displayName: data.displayName.trim(),
      bio: data.bio?.trim() || null,
      region: data.region.trim(),
      timezone: data.timezone.trim(),
      language: data.language?.trim() || null,
      micPreference: data.micPreference.trim(),
      schedule: data.schedule?.trim() || null,
      preferredPlayType: data.preferredPlayType?.trim() || null,
      playstyleTraits: data.playstyleTraits ?? Prisma.JsonNull,
    },
    select: {
      displayName: true,
      bio: true,
      region: true,
      timezone: true,
      language: true,
      micPreference: true,
      schedule: true,
      preferredPlayType: true,
      playstyleTraits: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ profile });
}
