import { ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/errors";
import { requireUser } from "@/lib/auth/require-user";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();

    const clips = await db.clip.findMany({
      where: {
        userId: user.id,
      },
      include: {
        game: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ok({ clips });
  } catch (error) {
    return handleRouteError(error);
  }
}
