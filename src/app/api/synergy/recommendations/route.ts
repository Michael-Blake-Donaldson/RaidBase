import { NextResponse } from "next/server";
import { z } from "zod";

import { getSynergyRecommendations } from "@/server/services/synergy";

const querySchema = z.object({
  username: z.string().min(3).max(24),
  game: z.string().min(2).max(64).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);

  const parsed = querySchema.safeParse({
    username: url.searchParams.get("username"),
    game: url.searchParams.get("game") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters." }, { status: 400 });
  }

  const recommendations = await getSynergyRecommendations(parsed.data.username, parsed.data.game);
  return NextResponse.json({ recommendations });
}