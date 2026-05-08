import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarRange, Headset, ShieldCheck, Swords, Video } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { readClips, readPlayers } from "@/server/queries/content";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const players = await readPlayers();
  const player = players.find((entry) => entry.username === username);

  if (!player) {
    return {
      title: "Profile not found | Raidbase",
    };
  }

  return {
    title: `${player.displayName} | Raidbase Profile`,
    description: `${player.displayName} plays ${player.games.join(", ")} with ${player.reputation.join(", ")} trust signals on Raidbase.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const [players, featuredClips] = await Promise.all([readPlayers(), readClips()]);
  const player = players.find((entry) => entry.username === username);

  if (!player) {
    notFound();
  }

  return (
    <SiteShell
      activePath="/profile"
      eyebrow="Player profile"
      title={`${player.displayName} is built for repeat queues, not one-off luck.`}
      description="Profiles combine games, roles, schedule, clips, and trust badges into a gaming resume that helps squads choose people with context instead of hype."
    >
      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="space-y-6">
          <article className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5">
            <div className="h-48 bg-[linear-gradient(135deg,rgba(45,168,255,0.42),rgba(139,92,255,0.26),rgba(5,11,20,0.85))]" />
            <div className="p-6 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-100">@{player.username}</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{player.displayName}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{player.tagline}</p>
                </div>
                <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-center">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-100">Synergy score</p>
                  <p className="mt-2 text-4xl font-semibold text-white">{player.synergy}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Swords className="h-4 w-4 text-cyan-200" />
                    Rank and role
                  </p>
                  <p className="text-sm leading-7 text-slate-300">{player.rank}</p>
                  <p className="text-sm text-slate-400">{player.role}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <CalendarRange className="h-4 w-4 text-cyan-200" />
                    Availability
                  </p>
                  <p className="text-sm leading-7 text-slate-300">{player.schedule}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Headset className="h-4 w-4 text-cyan-200" />
                    Comms
                  </p>
                  <p className="text-sm leading-7 text-slate-300">{player.mic}</p>
                  <p className="text-sm text-slate-400">{player.region}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-cyan-200" />
              <h3 className="text-2xl font-semibold text-white">Public trust badges</h3>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {player.reputation.map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-slate-100">
                  {badge}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              These badges are only shown after the minimum review threshold is met, using structured ratings instead of public negative comment walls.
            </p>
          </article>
        </section>

        <aside className="space-y-6">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
              <h3 className="text-xl font-semibold text-white">Main games</h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {player.games.map((game) => (
                <span key={game} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                  {game}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-cyan-200" />
              <h3 className="text-xl font-semibold text-white">Featured clips</h3>
            </div>
            <div className="mt-4 space-y-3">
              {featuredClips.map((clip) => (
                <div key={clip.title} className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-sm font-medium text-white">{clip.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{clip.game} • {clip.duration} • {clip.views}</p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </SiteShell>
  );
}