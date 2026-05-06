import { NextResponse } from "next/server";
import { z } from "zod";

const vitalsSchema = z.object({
  id: z.string().min(1),
  name: z.enum(["CLS", "FCP", "INP", "LCP", "TTFB"]),
  value: z.number().finite(),
  rating: z.enum(["good", "needs-improvement", "poor"]),
  delta: z.number().finite(),
  navigationType: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = vitalsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const metric = parsed.data;
  console.info("[web-vitals]", JSON.stringify(metric));

  return NextResponse.json({ ok: true });
}
