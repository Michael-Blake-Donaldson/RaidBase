import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";
import { getUserEntitlements } from "@/server/services/entitlements";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const data = await getUserEntitlements(session.user.id);
  return NextResponse.json(data);
}