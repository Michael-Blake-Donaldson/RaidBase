import { z } from "zod";

import { ok, fail } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
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

  return ok({ clips });
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const rateLimit = await enforceRateLimit({
      key: `clips-create:${user.id}:${getClientIp(request)}`,
      limit: 12,
      windowMs: 60_000,
    });

    if (!rateLimit.ok) {
      return fail("RATE_LIMITED", "Too many upload attempts. Try again shortly.", 429);
    }

    const slotCheck = await assertClipSlots(user.id);
    if (!slotCheck.ok) {
      return fail("FORBIDDEN", `Clip limit reached (${slotCheck.clipLimit}). Upgrade to Pro for more slots.`, 403);
    }

    const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      const titleRaw = form.get("title");
      const gameSlugRaw = form.get("gameSlug");
      const visibilityRaw = form.get("visibility");

      if (!(file instanceof File)) {
        return fail("BAD_REQUEST", "No clip file provided.", 400);
      }

      const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
      if (title.length < 4 || title.length > 120) {
        return fail("BAD_REQUEST", "Title must be between 4 and 120 characters.", 400);
      }

      if (!allowedVideoMimeTypes.has(file.type)) {
        return fail("BAD_REQUEST", "Unsupported file type. Use mp4, webm, or mov.", 400);
      }

      if (file.size > maxUploadBytes) {
        return fail("BAD_REQUEST", "Clip is too large. Max size is 50MB.", 400);
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
          userId: user.id,
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
        userId: user.id,
        type: "GENERAL",
        title: "Clip uploaded",
        body: `"${created.title}" is now in your clip showcase.`,
        href: "/clips",
      });

      return ok({ clip: created }, { status: 201 });
    }

    const body = await request.json().catch(() => null);
    const parsed = externalClipSchema.safeParse(body);

    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid clip payload.", 400);
    }

    const gameId = await resolveGameId(parsed.data.gameSlug);
    const created = await db.clip.create({
      data: {
        userId: user.id,
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
      userId: user.id,
      type: "GENERAL",
      title: "Clip link added",
      body: `"${created.title}" was added to your showcase.`,
      href: "/clips",
    });

    return ok({ clip: created }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
