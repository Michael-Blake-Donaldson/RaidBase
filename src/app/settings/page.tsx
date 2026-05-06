import { SiteShell } from "@/components/site-shell";
import { SettingsClient } from "@/components/settings-client";
import { getServerAuthSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    throw new Error("Authenticated session required for settings page.");
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
    throw new Error("User profile missing. Run onboarding before accessing settings.");
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