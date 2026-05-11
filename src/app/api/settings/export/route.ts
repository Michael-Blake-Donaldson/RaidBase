import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { fail } from "@/lib/api-response";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { emitObservabilityEvent, getRequestId } from "@/lib/observability";

export async function GET() {
  const requestId = await getRequestId();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      const response = fail("UNAUTHORIZED", "Authentication required.", 401);
      response.headers.set("x-request-id", requestId);
      return response;
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        userGames: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                slug: true,
                genre: true,
                platform: true,
              },
            },
          },
        },
        createdLfgPosts: true,
        lfgApplications: true,
        ownedSquads: true,
        squadMembership: true,
        sessionRecords: true,
        writtenReviews: true,
        receivedReviews: true,
        reputation: true,
        clips: true,
        notifications: true,
        subscription: true,
        reportsFiled: true,
      },
    });

    if (!user) {
      const response = fail("NOT_FOUND", "Account not found.", 404);
      response.headers.set("x-request-id", requestId);
      return response;
    }

    await emitObservabilityEvent({
      event: "account_data_exported",
      requestId,
      payload: {
        userId: user.id,
        username: user.username,
      },
    });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      },
      profile: user.profile,
      userGames: user.userGames,
      createdLfgPosts: user.createdLfgPosts,
      lfgApplications: user.lfgApplications,
      ownedSquads: user.ownedSquads,
      squadMembership: user.squadMembership,
      sessionRecords: user.sessionRecords,
      writtenReviews: user.writtenReviews,
      receivedReviews: user.receivedReviews,
      reputation: user.reputation,
      clips: user.clips,
      notifications: user.notifications,
      subscription: user.subscription,
      reportsFiled: user.reportsFiled,
    };

    const filename = `raidbase-export-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
        "x-request-id": requestId,
      },
    });
  } catch {
    const response = fail("INTERNAL_SERVER_ERROR", "Could not export account data.", 500);
    response.headers.set("x-request-id", requestId);
    return response;
  }
}
