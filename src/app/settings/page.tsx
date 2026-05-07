import { SiteShell } from "@/components/site-shell";
import { SettingsClient } from "@/components/settings-client";
import { getServerAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=%2Fsettings");
  }

  const profile = await db.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      displayName: true,
      bio: true,
      region: true,
      timezone: true,
      language: true,
      micPreference: true,
      schedule: true,
      updatedAt: true,
    },
  });

  if (!profile) {
    redirect("/auth/register");
  }

  return (
    <SiteShell
      activePath="/settings"
      eyebrow="Settings"
      title="Trust, privacy, billing, and notifications belong in one place."
      description="This page is fully wired to your account. Profile preferences save to the database, billing portal opens when configured, and account controls are live."
    >
      <SettingsClient
        username={session.user.username}
        email={session.user.email ?? ""}
        initialProfile={profile}
        lastSyncedAt={profile.updatedAt.toISOString()}
      />
    </SiteShell>
  );
}