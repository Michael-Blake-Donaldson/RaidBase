import { Filter, Mic, TimerReset, Users } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { lfgPosts } from "@/lib/site-data";

const filterPills = [
  "Tactical shooters",
  "NA Central",
  "Mic required",
  "Weeknight stack",
  "Competitive tone",
  "High trust only",
];

export default function LfgPage() {
  return (
    <SiteShell
      activePath="/lfg"
      eyebrow="LFG grid"
      title="Find squads by compatibility, not guesswork."
      description="Posts are filtered by game, rank, region, role needs, mic requirements, schedule, and trust signals so players can choose reliable teammates fast."
    >
      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-cyan-200" />
            <h2 className="text-xl font-semibold text-white">Filter stack</h2>
          </div>
          <p className="text-sm leading-7 text-slate-300">
            The MVP keeps filters obvious and low-friction: game, rank band, region, role, tone, schedule, and mic preference. Saved filters and boosted posts land in Pro later.
          </p>
          <div className="flex flex-wrap gap-2">
            {filterPills.map((pill) => (
              <span key={pill} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-xs text-slate-200">
                {pill}
              </span>
            ))}
          </div>
          <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-100">
            Auto-suggestions prioritize users with compatible schedules, low conflict history, and roles your current group still lacks.
          </div>
        </aside>

        <section className="grid gap-4">
          {lfgPosts.map((post) => (
            <article key={post.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                  <p className="mt-2 text-sm text-slate-400">{post.game} • {post.region} • {post.rank}</p>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
                  {post.openSpots} open spots
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Users className="h-4 w-4 text-cyan-200" />
                    Roles needed
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.roles.map((role) => (
                      <span key={role} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <TimerReset className="h-4 w-4 text-cyan-200" />
                    Schedule and tone
                  </p>
                  <p className="text-sm leading-7 text-slate-300">{post.schedule}</p>
                  <p className="text-sm text-slate-400">{post.tone}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Mic className="h-4 w-4 text-cyan-200" />
                    Comms expectation
                  </p>
                  <p className="text-sm leading-7 text-slate-300">
                    {post.micRequired ? "Microphone required for callouts and review" : "Mic optional, but concise communication preferred"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}