import { Filter } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { LfgCard } from "@/components/raidbase";
import { EmptyState } from "@/components/states";
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
          <div className="rb-badge-info rounded-3xl p-4 text-sm leading-7">
            Auto-suggestions prioritize users with compatible schedules, low conflict history, and roles your current group still lacks.
          </div>
        </aside>

        <section className="grid gap-4 content-start">
          {lfgPosts.length === 0 ? (
            <EmptyState
              title="No LFG posts yet"
              description="Be the first to post — your squad is waiting."
            />
          ) : (
            lfgPosts.map((post) => (
              <LfgCard
                key={post.id}
                id={post.id}
                title={post.title}
                game={post.game}
                region={post.region}
                rank={post.rank}
                roles={post.roles}
                schedule={post.schedule}
                tone={post.tone}
                micRequired={post.micRequired}
                openSpots={post.openSpots}
              />
            ))
          )}
        </section>
      </div>
    </SiteShell>
  );
}