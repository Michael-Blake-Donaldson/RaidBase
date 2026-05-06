import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarRange,
  Gamepad2,
  Shield,
  Sparkles,
  Stars,
  Users,
  Video,
} from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import {
  activityFeed,
  featuredClips,
  lfgPosts,
  platformStats,
  recommendedPlayers,
  squads,
} from "@/lib/site-data";

export default function Home() {
  return (
    <SiteShell
      activePath="/"
      eyebrow="Command center"
      title="Stop queueing with strangers who ruin the night."
      description="Raidbase is a competitive player identity layer for PC gaming: profile depth, trust-aware LFG, squad continuity, clip proof, and session-based synergy in one premium command center."
    >
      <div className="grid-overlay space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(45,168,255,0.16),rgba(139,92,255,0.08),rgba(61,255,174,0.08))] p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em] text-cyan-100">
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1">
                Web-first desktop MVP
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                Profiles + LFG + squads + trust
              </span>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="max-w-3xl font-display text-4xl font-semibold tracking-tight text-white lg:text-6xl">
                  Build a squad identity that proves skill, reliability, and teammate fit.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
                  The MVP prioritizes verified-looking profiles, fast teammate discovery, reputation after real sessions, and clips that show who a player actually is under pressure.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/profile/ghosttrace"
                    className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    Open player profile
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/lfg"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-5 py-3 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/10"
                  >
                    Browse LFG board
                    <Users className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[24px] border border-white/12 bg-slate-950/45 p-5">
                  <p className="flex items-center gap-2 text-sm font-medium text-cyan-100">
                    <Sparkles className="h-4 w-4" />
                    Why this product exists
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Find players by rank, region, tone, schedule, comms style, and reliability instead of rolling the dice on random queue chemistry.
                  </p>
                </div>
                <div className="rounded-[24px] border border-emerald-300/15 bg-emerald-300/8 p-5">
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-100">
                    <Shield className="h-4 w-4" />
                    Anti-abuse rules
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Reputation only publishes after reviewer thresholds, duplicate session reviews are blocked, and moderation queues catch suspicious cluster behavior early.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {platformStats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-[24px] border border-white/10 bg-white/6 p-5 backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{stat.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-3xl font-semibold text-white lg:text-4xl">{stat.value}</p>
                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                    {stat.delta}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[1fr_1fr_0.78fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Recommended teammates</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">High-fit players for tonight</h3>
              </div>
              <BadgeCheck className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-4">
              {recommendedPlayers.map((player) => (
                <Link
                  key={player.username}
                  href={`/profile/${player.username}`}
                  className="block rounded-[24px] border border-white/10 bg-slate-950/45 p-5 transition hover:border-cyan-300/30 hover:bg-slate-950/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{player.displayName}</h4>
                      <p className="mt-1 text-sm text-slate-400">{player.rank} • {player.role} • {player.region}</p>
                    </div>
                    <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                      {player.synergy}% fit
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{player.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {player.reputation.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Live LFG board</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Filters that respect trust and role fit</h3>
              </div>
              <Gamepad2 className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-4">
              {lfgPosts.slice(0, 3).map((post) => (
                <div key={post.title} className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-semibold text-white">{post.title}</h4>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                      {post.openSpots} spots
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{post.game} • {post.region} • {post.rank}</p>
                  <p className="mt-3 text-sm text-slate-300">{post.schedule} • {post.tone}</p>
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
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Activity feed</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Useful next actions</h3>
              </div>
              <Bell className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-4">
              {activityFeed.map((item) => (
                <div key={item} className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Featured clips</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Proof of skill, style, and leadership</h3>
              </div>
              <Video className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {featuredClips.map((clip) => (
                <article key={clip.title} className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/50">
                  <div className="flex aspect-video items-end bg-[linear-gradient(135deg,rgba(45,168,255,0.35),rgba(139,92,255,0.25),rgba(5,11,20,0.65))] p-4">
                    <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
                      {clip.mood}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="text-base font-semibold text-white">{clip.title}</h4>
                    <p className="mt-2 text-sm text-slate-400">{clip.player} • {clip.game}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                      <span>{clip.duration}</span>
                      <span>{clip.views} views</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Persistent squads</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Teams with measurable chemistry</h3>
              </div>
              <Stars className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-4">
              {squads.map((squad) => (
                <article key={squad.name} className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{squad.name}</h4>
                      <p className="mt-1 text-sm text-slate-400">{squad.game} • {squad.members} members • {squad.status}</p>
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
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <CalendarRange className="h-5 w-5 text-cyan-200" />
              <h3 className="text-xl font-semibold text-white">Onboarding flow</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Email or OAuth sign-up, unique username checks, region/timezone setup, manual game rank entry, first clip or bio, and suggested filters before the first queue.
            </p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-cyan-200" />
              <h3 className="text-xl font-semibold text-white">Reputation model</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Reliable, skilled, communicative, and team-behavior ratings are weighted by verified sessions, reviewer uniqueness, and repeat-teammate intent.
            </p>
          </article>
          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-cyan-200" />
              <h3 className="text-xl font-semibold text-white">Monetization</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Free discovery for everyone, with a $5 Pro tier unlocking profile customization, extra clips, analytics, and boosted discovery surfaces.
            </p>
          </article>
        </section>
      </div>
    </SiteShell>
  );
}
