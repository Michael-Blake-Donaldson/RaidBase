import { NextResponse } from "next/server";
import { z } from "zod";

import { emitObservabilityEvent, getRequestId } from "@/lib/observability";

const clientErrorSchema = z.object({
  digest: z.string().min(1).optional(),
  message: z.string().min(1),
  stack: z.string().min(1).optional(),
  path: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const requestId = await getRequestId();
  const body = await request.json().catch(() => null);
  const parsed = clientErrorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, requestId }, { status: 400 });
  }

  await emitObservabilityEvent({
    event: "client_error_reported",
    level: "error",
    requestId,
    payload: parsed.data,
  });

  return NextResponse.json({ ok: true, requestId });
}