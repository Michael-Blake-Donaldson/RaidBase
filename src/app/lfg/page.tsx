import { Filter } from "lucide-react";

import { LfgInteractiveBoard } from "@/components/lfg-interactive-board";
import { SiteShell } from "@/components/site-shell";
import { getServerAuthSession } from "@/lib/auth/session";
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
  const [lfgPosts, session] = await Promise.all([readLfgPosts(), getServerAuthSession()]);

  return (
    <SiteShell
      activePath="/lfg"
      eyebrow="LFG grid"
      title="Find squads by compatibility, not guesswork."
      description="Posts are filtered by game, rank, region, role needs, mic requirements, schedule, and trust signals so players can choose reliable teammates fast."
    >
      <div className="grid gap-6 xl:grid-cols-[0.62fr_1.38fr]">
        <aside className="space-y-4 border border-white/10 bg-slate-950/30 p-6 xl:sticky xl:top-28 xl:h-fit">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-cyan-200" />
            <h2 className="text-xl font-semibold text-white">Filter stack</h2>
          </div>
          <p className="text-sm leading-7 text-slate-300">
            The MVP keeps filters obvious and low-friction: game, rank band, region, role, tone, schedule, and mic preference. Saved filters and boosted posts land in Pro later.
          </p>
          <div className="flex flex-wrap gap-2">
            {filterPills.map((pill) => (
              <span key={pill} className="rounded-full border border-white/15 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
                {pill}
              </span>
            ))}
          </div>
          <div className="border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-100">
            Auto-suggestions prioritize users with compatible schedules, low conflict history, and roles your current group still lacks.
          </div>
        </aside>

        <LfgInteractiveBoard initialPosts={lfgPosts} isAuthenticated={Boolean(session?.user?.id)} />
      </div>
    </SiteShell>
  );
}