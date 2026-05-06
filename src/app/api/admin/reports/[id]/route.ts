import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";

const updateReportSchema = z.object({
  status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]),
  details: z.string().max(800).optional(),
});

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateReportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report update payload." }, { status: 400 });
  }

  const { id } = await params;

  const updated = await db.report.update({
    where: { id },
    data: {
      status: parsed.data.status,
      details: parsed.data.details,
      moderatorId: session.user.id,
    },
  });

  return NextResponse.json({ report: updated });
}