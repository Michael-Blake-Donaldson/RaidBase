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
  platformStats,
} from "@/lib/site-data";
import { readClips, readLfgPosts, readPlayers, readSquads } from "@/server/queries/content";

export default async function Home() {
  const [recommendedPlayers, lfgPosts, featuredClips, squads] = await Promise.all([
    readPlayers(),
    readLfgPosts(),
    readClips(),
    readSquads(),
  ]);

  return (
    <SiteShell
      activePath="/"
      eyebrow="Command center"
      title="Stop queueing with strangers who ruin the night."
      description="Raidbase is a competitive player identity layer for PC gaming: profile depth, trust-aware LFG, squad continuity, clip proof, and session-based synergy in one premium command center."
    >
      <div className="grid-overlay space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
          <div className="rb-surface-strong overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,rgba(59,130,246,0.12),rgba(139,92,246,0.07),rgba(16,185,129,0.08))] p-6 lg:p-8">
            <div className="rb-icon flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.28em]">
              <span className="rb-badge-info rounded-full px-3 py-1">
                Web-first desktop MVP
              </span>
              <span className="rb-pill rounded-full px-3 py-1">
                Profiles + LFG + squads + trust
              </span>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="rb-text-strong max-w-3xl font-display text-4xl font-semibold tracking-tight lg:text-6xl">
                  Build a squad identity that proves skill, reliability, and teammate fit.
                </h2>
                <p className="rb-text-body mt-5 max-w-2xl text-sm leading-7 lg:text-base">
                  The MVP prioritizes verified-looking profiles, fast teammate discovery, reputation after real sessions, and clips that show who a player actually is under pressure.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/profile/ghosttrace"
                    className="rb-button-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition"
                  >
                    Open player profile
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/lfg"
                    className="rb-button-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition"
                  >
                    Browse LFG board
                    <Users className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rb-surface rounded-[24px] p-5">
                  <p className="rb-icon flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    Why this product exists
                  </p>
                  <p className="rb-text-body mt-3 text-sm leading-7">
                    Find players by rank, region, tone, schedule, comms style, and reliability instead of rolling the dice on random queue chemistry.
                  </p>
                </div>
                <div className="rb-badge-success rounded-[24px] p-5">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Shield className="h-4 w-4" />
                    Anti-abuse rules
                  </p>
                  <p className="mt-3 text-sm leading-7">
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
                className="rb-surface-strong rounded-[24px] p-5"
              >
                <p className="rb-text-muted text-xs uppercase tracking-[0.28em]">{stat.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="rb-text-strong text-3xl font-semibold lg:text-4xl">{stat.value}</p>
                  <span className="rb-badge-info rounded-full px-3 py-1 text-xs">
                    {stat.delta}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[1fr_1fr_0.78fr]">
          <article className="rb-surface-strong rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="rb-text-muted text-xs uppercase tracking-[0.28em]">Recommended teammates</p>
                <h3 className="rb-text-strong mt-2 text-2xl font-semibold">High-fit players for tonight</h3>
              </div>
              <BadgeCheck className="rb-icon h-5 w-5" />
            </div>
            <div className="space-y-4">
              {recommendedPlayers.map((player) => (
                <Link
                  key={player.username}
                  href={`/profile/${player.username}`}
                  className="rb-surface-soft block rounded-[24px] p-5 transition hover:border-blue-300 hover:bg-[#f1f5f9]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="rb-text-strong text-lg font-semibold">{player.displayName}</h4>
                      <p className="rb-text-muted mt-1 text-sm">{player.rank} • {player.role} • {player.region}</p>
                    </div>
                    <div className="rb-badge-info rounded-full px-3 py-1 text-sm font-semibold">
                      {player.synergy}% fit
                    </div>
                  </div>
                  <p className="rb-text-body mt-3 text-sm leading-7">{player.tagline}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {player.reputation.map((tag) => (
                      <span
                        key={tag}
                        className="rb-pill rounded-full px-3 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <article className="rb-surface-strong rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="rb-text-muted text-xs uppercase tracking-[0.28em]">Live LFG board</p>
                <h3 className="rb-text-strong mt-2 text-2xl font-semibold">Filters that respect trust and role fit</h3>
              </div>
              <Gamepad2 className="rb-icon h-5 w-5" />
            </div>
            <div className="space-y-4">
              {lfgPosts.slice(0, 3).map((post) => (
                <div key={post.title} className="rb-surface-soft rounded-[24px] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="rb-text-strong text-base font-semibold">{post.title}</h4>
                    <span className="rb-badge-success rounded-full px-3 py-1 text-xs">
                      {post.openSpots} spots
                    </span>
                  </div>
                  <p className="rb-text-muted mt-2 text-sm">{post.game} • {post.region} • {post.rank}</p>
                  <p className="rb-text-body mt-3 text-sm">{post.schedule} • {post.tone}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.roles.map((role) => (
                      <span key={role} className="rb-pill rounded-full px-3 py-1 text-xs">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rb-surface-strong rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="rb-text-muted text-xs uppercase tracking-[0.28em]">Activity feed</p>
                <h3 className="rb-text-strong mt-2 text-2xl font-semibold">Useful next actions</h3>
              </div>
              <Bell className="rb-icon h-5 w-5" />
            </div>
            <div className="space-y-4">
              {activityFeed.map((item) => (
                <div key={item} className="rb-surface-soft rb-text-body rounded-[22px] p-4 text-sm leading-7">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
          <article className="rb-surface-strong rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="rb-text-muted text-xs uppercase tracking-[0.28em]">Featured clips</p>
                <h3 className="rb-text-strong mt-2 text-2xl font-semibold">Proof of skill, style, and leadership</h3>
              </div>
              <Video className="rb-icon h-5 w-5" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {featuredClips.map((clip) => (
                <article key={clip.title} className="rb-surface-soft overflow-hidden rounded-[24px]">
                  <div className="flex aspect-video items-end bg-[linear-gradient(135deg,rgba(59,130,246,0.35),rgba(139,92,246,0.25),rgba(30,41,59,0.62))] p-4">
                    <span className="rb-badge-info rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em]">
                      {clip.mood}
                    </span>
                  </div>
                  <div className="p-4">
                    <h4 className="rb-text-strong text-base font-semibold">{clip.title}</h4>
                    <p className="rb-text-muted mt-2 text-sm">{clip.player} • {clip.game}</p>
                    <div className="rb-text-muted mt-3 flex items-center justify-between text-xs">
                      <span>{clip.duration}</span>
                      <span>{clip.views} views</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="rb-surface-strong rounded-[28px] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="rb-text-muted text-xs uppercase tracking-[0.28em]">Persistent squads</p>
                <h3 className="rb-text-strong mt-2 text-2xl font-semibold">Teams with measurable chemistry</h3>
              </div>
              <Stars className="rb-icon h-5 w-5" />
            </div>
            <div className="space-y-4">
              {squads.map((squad) => (
                <article key={squad.name} className="rb-surface-soft rounded-[24px] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="rb-text-strong text-lg font-semibold">{squad.name}</h4>
                      <p className="rb-text-muted mt-1 text-sm">{squad.game} • {squad.members} members • {squad.status}</p>
                    </div>
                    <div className="rb-badge-info rounded-full px-3 py-1 text-sm font-semibold">
                      {squad.synergy}% synergy
                    </div>
                  </div>
                  <p className="rb-text-body mt-3 text-sm">{squad.activity}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {squad.openRoles.map((role) => (
                      <span key={role} className="rb-pill rounded-full px-3 py-1 text-xs">
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
          <article className="rb-surface-strong rounded-[28px] p-6">
            <div className="flex items-center gap-3">
              <CalendarRange className="rb-icon h-5 w-5" />
              <h3 className="rb-text-strong text-xl font-semibold">Onboarding flow</h3>
            </div>
            <p className="rb-text-body mt-4 text-sm leading-7">
              Email or OAuth sign-up, unique username checks, region/timezone setup, manual game rank entry, first clip or bio, and suggested filters before the first queue.
            </p>
          </article>
          <article className="rb-surface-strong rounded-[28px] p-6">
            <div className="flex items-center gap-3">
              <Shield className="rb-icon h-5 w-5" />
              <h3 className="rb-text-strong text-xl font-semibold">Reputation model</h3>
            </div>
            <p className="rb-text-body mt-4 text-sm leading-7">
              Reliable, skilled, communicative, and team-behavior ratings are weighted by verified sessions, reviewer uniqueness, and repeat-teammate intent.
            </p>
          </article>
          <article className="rb-surface-strong rounded-[28px] p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="rb-icon h-5 w-5" />
              <h3 className="rb-text-strong text-xl font-semibold">Monetization</h3>
            </div>
            <p className="rb-text-body mt-4 text-sm leading-7">
              Free discovery for everyone, with a $5 Pro tier unlocking profile customization, extra clips, analytics, and boosted discovery surfaces.
            </p>
          </article>
        </section>
      </div>
    </SiteShell>
  );
}
