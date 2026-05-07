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
            <article key={squad.name} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{squad.name}</h2>
                  <p className="mt-2 text-sm text-slate-400">{squad.game} • {squad.members} active members • {squad.status}</p>
                </div>
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                  {squad.synergy}% synergy
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{squad.activity}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {squad.openRoles.map((role) => (
                  <span key={role} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs text-slate-200">
                    {role}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <Users2 className="h-5 w-5 text-cyan-200" />
            <h2 className="text-xl font-semibold text-white">Squad health roadmap</h2>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">
            V1 tracks repeat sessions, mutual positive reviews, and low conflict reports. Later versions can predict fit and monitor attendance trends automatically.
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
              <Activity className="h-4 w-4 text-cyan-200" />
              Shared context
            </p>
            <p className="text-sm leading-7 text-slate-300">
              Session history, strategy notes, roles, recurring teammates, and featured clips give squads memory instead of making every night start from zero.
            </p>
          </div>
          <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-100">
              <ShieldCheck className="h-4 w-4" />
              Trust controls
            </p>
            <p className="text-sm leading-7 text-slate-200">
              Invite-only privacy, blocked-user enforcement, and moderation escalation keep squads from turning into ungoverned Discord clones.
            </p>
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}