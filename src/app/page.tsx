import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Gamepad2, ShieldCheck, Stars, Users, Video } from "lucide-react";

import { ActionCenter } from "@/components/action-center";
import { FirstSessionChecklist } from "@/components/first-session-checklist";
import { HomeIntentSwitcher } from "@/components/home-intent-switcher";
import { SessionPilot } from "@/components/session-pilot";
import { SiteShell } from "@/components/site-shell";
import { actionItems, platformStats } from "@/lib/site-data";
import { getServerAuthSession } from "@/lib/auth/session";
import { readClips, readLfgPosts, readPlayers, readSquads, readViewerContext } from "@/server/queries/content";

export default async function Home() {
  const session = await getServerAuthSession();

  const [recommendedPlayers, lfgPosts, featuredClips, squads, viewerContext] = await Promise.all([
    readPlayers(session?.user?.id),
    readLfgPosts(session?.user?.id),
    readClips(),
    readSquads(),
    readViewerContext(session?.user?.id),
  ]);

  const signedInUsername = session?.user?.username;

  return (
    <SiteShell
      activePath="/"
      eyebrow="Command center"
      title={signedInUsername ? `Welcome back, ${signedInUsername}. Your next reliable stack is ready.` : "Find your next reliable stack in under 60 seconds."}
      description="Raidbase gives you profile trust, role-fit matching, and persistent squads without forcing you to scan dense dashboards."
    >
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.45fr_0.88fr]">
          <article className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(140deg,rgba(45,168,255,0.16),rgba(8,17,32,0.88))] p-6 lg:p-8">
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/12 px-3 py-1 text-xs font-medium text-cyan-100">
              Production-ready UX sprint
            </p>

            <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-white lg:text-6xl">
              Cleaner signal, faster teammate decisions.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 lg:text-base">
              Start with two actions: open high-fit players and jump into filtered LFG. Everything else is supporting context, not noise.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/lfg"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Open LFG now
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              {!signedInUsername ? (
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20"
                >
                  Sign in for personalized matches
                </Link>
              ) : null}
              <Link
                href="/profile/ghosttrace"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/10"
              >
                Review sample profile
                <Users className="h-4 w-4" />
              </Link>
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Live platform snapshot</h3>
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
                Updated now
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {platformStats.slice(0, 3).map((stat) => (
                <article key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-2xl font-semibold text-white">{stat.value}</p>
                    <span className="text-xs text-cyan-100">{stat.delta}</span>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>

        <SessionPilot
          username={signedInUsername}
          regionHint={viewerContext?.region}
          timezoneHint={viewerContext?.timezone}
          recommendedCount={recommendedPlayers.length}
          lfgCount={lfgPosts.length}
          squadCount={squads.length}
        />

        <HomeIntentSwitcher
          playerCount={recommendedPlayers.length}
          lfgCount={lfgPosts.length}
          squadCount={squads.length}
        />

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <FirstSessionChecklist username={signedInUsername} />

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Trust transparency</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Why these recommendations appear first</h3>
              </div>
              <ShieldCheck className="h-5 w-5 text-cyan-200" />
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm font-medium text-white">Role and rank compatibility</p>
                <p className="mt-1 text-xs leading-6 text-slate-300">
                  We prioritize players whose role demand and rank window overlap your likely session needs.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm font-medium text-white">Schedule and communication fit</p>
                <p className="mt-1 text-xs leading-6 text-slate-300">
                  Time overlap and mic preferences are weighted before you spend time sending invites.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-sm font-medium text-white">Reputation quality threshold</p>
                <p className="mt-1 text-xs leading-6 text-slate-300">
                  Public badges are shown only after minimum reviewer thresholds to reduce brigading noise.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[1fr_1fr_0.85fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Recommended teammates</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Top fits for this session</h3>
              </div>
              <BadgeCheck className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-4">
              {recommendedPlayers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-slate-950/35 p-5 text-sm text-slate-300">
                  No fit suggestions yet. Complete role preferences to get recommendations.
                </div>
              ) : null}
              {recommendedPlayers.slice(0, 2).map((player) => (
                <Link
                  key={player.username}
                  href={`/profile/${player.username}`}
                  className="block rounded-[24px] border border-white/10 bg-slate-950/45 p-5 transition hover:border-cyan-300/30 hover:bg-slate-950/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{player.displayName}</h4>
                      <p className="mt-1 text-sm text-slate-400">
                        {player.rank} • {player.role} • {player.region}
                      </p>
                    </div>
                    <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                      {player.synergy}% fit
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{player.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {player.reputation.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/profile/ghosttrace" className="mt-4 inline-flex text-sm font-medium text-cyan-100 transition hover:text-cyan-50">
              View all recommended players
            </Link>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Live LFG board</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Fast join opportunities</h3>
              </div>
              <Gamepad2 className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-4">
              {lfgPosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-slate-950/35 p-5 text-sm text-slate-300">
                  No open posts right now. Check back in a minute or widen region filters.
                </div>
              ) : null}
              {lfgPosts.slice(0, 3).map((post) => (
                <div key={post.title} className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-semibold text-white">{post.title}</h4>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                      {post.openSpots} spots
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {post.game} • {post.region} • {post.rank}
                  </p>
                  <p className="mt-3 text-sm text-slate-300">
                    {post.schedule} • {post.tone}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.roles.map((role) => (
                      <span key={role} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Link href="/lfg" className="mt-4 inline-flex text-sm font-medium text-cyan-100 transition hover:text-cyan-50">
              Open full LFG board
            </Link>
          </article>

          <ActionCenter items={actionItems} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Featured clips</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Quick proof before invite</h3>
              </div>
              <Video className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {featuredClips.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-slate-950/35 p-5 text-sm text-slate-300 lg:col-span-3">
                  No clips uploaded yet.
                </div>
              ) : null}
              {featuredClips.slice(0, 3).map((clip) => (
                <article key={clip.title} className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/50">
                  <div className="flex aspect-video items-end bg-[linear-gradient(135deg,rgba(45,168,255,0.35),rgba(139,92,255,0.25),rgba(5,11,20,0.65))] p-4">
                    <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs text-white">{clip.mood}</span>
                  </div>
                  <div className="p-4">
                    <h4 className="text-base font-semibold text-white">{clip.title}</h4>
                    <p className="mt-2 text-sm text-slate-400">
                      {clip.player} • {clip.game}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                      <span>{clip.duration}</span>
                      <span>{clip.views} views</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <Link href="/clips" className="mt-4 inline-flex text-sm font-medium text-cyan-100 transition hover:text-cyan-50">
              Browse all clips
            </Link>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Persistent squads</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Stable teams worth joining</h3>
              </div>
              <Stars className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-4">
              {squads.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-slate-950/35 p-5 text-sm text-slate-300">
                  No squads are currently recruiting.
                </div>
              ) : null}
              {squads.slice(0, 2).map((squad) => (
                <article key={squad.name} className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{squad.name}</h4>
                      <p className="mt-1 text-sm text-slate-400">
                        {squad.game} • {squad.members} members • {squad.status}
                      </p>
                    </div>
                    <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                      {squad.synergy}% synergy
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{squad.activity}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {squad.openRoles.map((role) => (
                      <span key={role} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                        {role}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <Link href="/squads" className="mt-4 inline-flex text-sm font-medium text-cyan-100 transition hover:text-cyan-50">
              View all squads
            </Link>
          </article>
        </section>
      </div>
    </SiteShell>
  );
}
