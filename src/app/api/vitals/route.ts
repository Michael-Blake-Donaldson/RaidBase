import { NextResponse } from "next/server";
import { z } from "zod";

import { emitObservabilityEvent, getRequestId } from "@/lib/observability";

const vitalsSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  value: z.number().finite(),
  rating: z.string().min(1).optional(),
  delta: z.number().finite(),
  navigationType: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const requestId = await getRequestId();
  const body = await request.json().catch(() => null);
  const parsed = vitalsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, requestId }, { status: 400 });
  }

  const metric = parsed.data;

  await emitObservabilityEvent({
    event: "web_vital_recorded",
    requestId,
    payload: metric,
  });

  return NextResponse.json({ ok: true, requestId });
}
