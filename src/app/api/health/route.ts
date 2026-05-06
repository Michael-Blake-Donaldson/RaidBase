import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  const startedAt = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        checks: {
          database: "fail",
        },
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    status: "ok",
    checks: {
      database: "pass",
    },
    responseTimeMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  });
}
