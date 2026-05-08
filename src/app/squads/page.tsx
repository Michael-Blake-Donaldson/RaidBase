import { Activity, ShieldCheck, Users2 } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { readSquads } from "@/server/queries/content";

export default async function SquadsPage() {
  const squads = await readSquads();

  return (
    <SiteShell
      activePath="/squads"
      eyebrow="Squad hub"
      title="Give good teams a home that survives one session."
      description="Persistent squads keep members, session history, role coverage, synergy, clip walls, and recruiting state visible in one shared operating surface."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="grid gap-4">
          {squads.map((squad) => (
            <article key={squad.name} className="rb-surface-strong rounded-[28px] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="rb-text-strong text-2xl font-semibold">{squad.name}</h2>
                  <p className="rb-text-muted mt-2 text-sm">{squad.game} • {squad.members} active members • {squad.status}</p>
                </div>
                <span className="rb-badge-info rounded-full px-3 py-1 text-sm font-semibold">
                  {squad.synergy}% synergy
                </span>
              </div>
              <p className="rb-text-body mt-4 text-sm leading-7">{squad.activity}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {squad.openRoles.map((role) => (
                  <span key={role} className="rb-pill rounded-full px-3 py-1 text-xs">
                    {role}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>

        <aside className="rb-surface-strong space-y-4 rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <Users2 className="rb-icon h-5 w-5" />
            <h2 className="rb-text-strong text-xl font-semibold">Squad health roadmap</h2>
          </div>
          <div className="rb-surface-soft rb-text-body rounded-3xl p-4 text-sm leading-7">
            V1 tracks repeat sessions, mutual positive reviews, and low conflict reports. Later versions can predict fit and monitor attendance trends automatically.
          </div>
          <div className="rb-surface-soft rounded-3xl p-4">
            <p className="rb-text-strong mb-2 flex items-center gap-2 text-sm font-medium">
              <Activity className="rb-icon h-4 w-4" />
              Shared context
            </p>
            <p className="rb-text-body text-sm leading-7">
              Session history, strategy notes, roles, recurring teammates, and featured clips give squads memory instead of making every night start from zero.
            </p>
          </div>
          <div className="rb-badge-success rounded-3xl p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Trust controls
            </p>
            <p className="text-sm leading-7">
              Invite-only privacy, blocked-user enforcement, and moderation escalation keep squads from turning into ungoverned Discord clones.
            </p>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}