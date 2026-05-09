import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getObservabilityEnv } from "@/lib/env";
import { getRequestId } from "@/lib/observability";

export async function GET() {
  const startedAt = Date.now();
  const requestId = await getRequestId();
  const { serviceName, environment } = getObservabilityEnv();

  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        service: serviceName,
        environment,
        requestId,
        checks: {
          database: "fail",
        },
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    status: "ok",
    service: serviceName,
    environment,
    requestId,
    checks: {
      database: "pass",
    },
    responseTimeMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  });
}
