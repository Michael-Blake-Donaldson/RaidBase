import { Filter, Mic, TimerReset, Users } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { readLfgPosts } from "@/server/queries/content";

const filterPills = [
  "Tactical shooters",
  "NA Central",
  "Mic required",
  "Weeknight stack",
  "Competitive tone",
  "High trust only",
];

export default async function LfgPage() {
  const lfgPosts = await readLfgPosts();

  return (
    <SiteShell
      activePath="/lfg"
      eyebrow="LFG grid"
      title="Find squads by compatibility, not guesswork."
      description="Posts are filtered by game, rank, region, role needs, mic requirements, schedule, and trust signals so players can choose reliable teammates fast."
    >
      <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <aside className="rb-surface-strong space-y-4 rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <Filter className="rb-icon h-5 w-5" />
            <h2 className="rb-text-strong text-xl font-semibold">Filter stack</h2>
          </div>
          <p className="rb-text-body text-sm leading-7">
            The MVP keeps filters obvious and low-friction: game, rank band, region, role, tone, schedule, and mic preference. Saved filters and boosted posts land in Pro later.
          </p>
          <div className="flex flex-wrap gap-2">
            {filterPills.map((pill) => (
              <span key={pill} className="rb-pill rounded-full px-3 py-2 text-xs">
                {pill}
              </span>
            ))}
          </div>
          <div className="rb-badge-info rounded-[24px] p-4 text-sm leading-7">
            Auto-suggestions prioritize users with compatible schedules, low conflict history, and roles your current group still lacks.
          </div>
        </aside>

        <section className="grid gap-4">
          {lfgPosts.map((post) => (
            <article key={post.title} className="rb-surface-strong rounded-[28px] p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="rb-text-strong text-xl font-semibold">{post.title}</h2>
                  <p className="rb-text-muted mt-2 text-sm">{post.game} • {post.region} • {post.rank}</p>
                </div>
                <span className="rb-badge-success rounded-full px-3 py-1 text-xs font-medium">
                  {post.openSpots} open spots
                </span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <div className="rb-surface-soft rounded-[22px] p-4">
                  <p className="rb-text-strong mb-2 flex items-center gap-2 text-sm font-medium">
                    <Users className="rb-icon h-4 w-4" />
                    Roles needed
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.roles.map((role) => (
                      <span key={role} className="rb-pill rounded-full px-3 py-1 text-xs">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rb-surface-soft rounded-[22px] p-4">
                  <p className="rb-text-strong mb-2 flex items-center gap-2 text-sm font-medium">
                    <TimerReset className="rb-icon h-4 w-4" />
                    Schedule and tone
                  </p>
                  <p className="rb-text-body text-sm leading-7">{post.schedule}</p>
                  <p className="rb-text-muted text-sm">{post.tone}</p>
                </div>
                <div className="rb-surface-soft rounded-[22px] p-4">
                  <p className="rb-text-strong mb-2 flex items-center gap-2 text-sm font-medium">
                    <Mic className="rb-icon h-4 w-4" />
                    Comms expectation
                  </p>
                  <p className="rb-text-body text-sm leading-7">
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