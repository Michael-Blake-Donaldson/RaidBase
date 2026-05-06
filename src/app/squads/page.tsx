import { SiteShell } from "@/components/site-shell";
import { SquadsInteractiveBoard } from "@/components/squads-interactive-board";
import { getServerAuthSession } from "@/lib/auth/session";
import { readSquads } from "@/server/queries/content";

export default async function SquadsPage() {
  const [squads, session] = await Promise.all([readSquads(), getServerAuthSession()]);

  return (
    <SiteShell
      activePath="/squads"
      eyebrow="Squad hub"
      title="Give good teams a home that survives one session."
      description="Persistent squads keep members, session history, role coverage, synergy, clip walls, and recruiting state visible in one shared operating surface."
    >
      <SquadsInteractiveBoard initialSquads={squads} isAuthenticated={Boolean(session?.user?.id)} />
    </SiteShell>
  );
}