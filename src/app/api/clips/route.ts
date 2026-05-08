import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/request";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createUserNotification } from "@/server/services/notifications";
import { getUserEntitlements } from "@/server/services/entitlements";
import { saveUploadedClipFile } from "@/server/services/clip-storage";

const externalClipSchema = z.object({
  title: z.string().min(4).max(120),
  url: z.string().url().max(500),
  gameSlug: z.string().min(2).max(64).optional(),
  tags: z.array(z.string().min(2).max(32)).max(10).optional(),
  thumbnailUrl: z.string().url().max(500).optional(),
  visibility: z.enum(["public", "private"]).default("public"),
});

const allowedVideoMimeTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const maxUploadBytes = 50 * 1024 * 1024;

function providerFromUrl(url: string) {
  const normalized = url.toLowerCase();

  if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) {
    return "YouTube";
  }

  if (normalized.includes("twitch.tv")) {
    return "Twitch";
  }

  if (normalized.includes("streamable.com")) {
    return "Streamable";
  }

  return "Link";
}

async function assertClipSlots(userId: string) {
  const [entitlements, totalClips] = await Promise.all([
    getUserEntitlements(userId),
    db.clip.count({ where: { userId } }),
  ]);

  const clipLimit = entitlements.clipLimit;

  if (totalClips >= clipLimit) {
    return {
      ok: false,
      clipLimit,
      totalClips,
    };
  }

  return {
    ok: true,
    clipLimit,
    totalClips,
  };
}

async function resolveGameId(gameSlug?: string) {
  if (!gameSlug) {
    return null;
  }

  const game = await db.game.findUnique({
    where: { slug: gameSlug.toLowerCase() },
    select: { id: true },
  });

  return game?.id ?? null;
}

export async function GET() {
  const clips = await db.clip.findMany({
    where: {
      visibility: "public",
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      game: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 40,
  });

  return NextResponse.json({ clips });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit({
    key: `clips-create:${session.user.id}:${getClientIp(request)}`,
    limit: 12,
    windowMs: 60_000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { error: "Too many upload attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } },
    );
  }

  const slotCheck = await assertClipSlots(session.user.id);
  if (!slotCheck.ok) {
    return NextResponse.json(
      {
        error: `Clip limit reached (${slotCheck.clipLimit}). Upgrade to Pro for more slots.`,
        clipLimit: slotCheck.clipLimit,
      },
      { status: 403 },
    );
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const titleRaw = form.get("title");
    const gameSlugRaw = form.get("gameSlug");
    const visibilityRaw = form.get("visibility");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No clip file provided." }, { status: 400 });
    }

    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    if (title.length < 4 || title.length > 120) {
      return NextResponse.json({ error: "Title must be between 4 and 120 characters." }, { status: 400 });
    }

    if (!allowedVideoMimeTypes.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type. Use mp4, webm, or mov." }, { status: 400 });
    }

    if (file.size > maxUploadBytes) {
      return NextResponse.json({ error: "Clip is too large. Max size is 50MB." }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const storedClip = await saveUploadedClipFile({
      mimeType: file.type,
      fileBuffer,
    });

    const gameSlug = typeof gameSlugRaw === "string" ? gameSlugRaw.trim() : "";
    const gameId = await resolveGameId(gameSlug || undefined);
    const visibility = visibilityRaw === "private" ? "private" : "public";

    const created = await db.clip.create({
      data: {
        userId: session.user.id,
        gameId,
        title,
        url: storedClip.publicUrl,
        provider: storedClip.provider,
        visibility,
        featured: false,
        viewCount: 0,
      },
      include: {
        game: true,
      },
    });

    await createUserNotification({
      userId: session.user.id,
      type: "clip_uploaded",
      title: "Clip uploaded",
      body: `\"${created.title}\" is now in your clip showcase.`,
      linkUrl: "/clips",
    });

    return NextResponse.json({ clip: created }, { status: 201 });
  }

  const body = await request.json().catch(() => null);
  const parsed = externalClipSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid clip payload." }, { status: 400 });
  }

  const gameId = await resolveGameId(parsed.data.gameSlug);
  const created = await db.clip.create({
    data: {
      userId: session.user.id,
      gameId,
      title: parsed.data.title.trim(),
      url: parsed.data.url,
      provider: providerFromUrl(parsed.data.url),
      tags: parsed.data.tags ?? [],
      thumbnailUrl: parsed.data.thumbnailUrl,
      visibility: parsed.data.visibility,
      featured: false,
      viewCount: 0,
    },
    include: {
      game: true,
    },
  });

  await createUserNotification({
    userId: session.user.id,
    type: "clip_added",
    title: "Clip link added",
    body: `\"${created.title}\" was added to your showcase.`,
    linkUrl: "/clips",
  });

  return NextResponse.json({ clip: created }, { status: 201 });
}
