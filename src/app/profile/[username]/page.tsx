import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarRange, Headset, ShieldCheck, Swords, Video } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { db } from "@/lib/db";
import { buildTrustSummary } from "@/server/services/reputation";

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await db.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
    include: {
      profile: true,
      userGames: {
        include: {
          game: true,
        },
      },
      reputation: true,
    },
  });

  if (!user?.profile) {
    return {
      title: "Profile not found | Raidbase",
    };
  }

  const trust = user.reputation
    ? buildTrustSummary({
        reliabilityScore: user.reputation.reliabilityScore,
        commsScore: user.reputation.commsScore,
        skillScore: user.reputation.skillScore,
        teamBehaviorScore: user.reputation.teamBehaviorScore,
        toxicityRisk: user.reputation.toxicityRisk,
        reviewCount: user.reputation.reviewCount,
        uniqueReviewers: user.reputation.uniqueReviewers,
        publicBadges: user.reputation.publicBadges,
      })
    : null;

  return {
    title: `${user.profile.displayName} | Raidbase Profile`,
    description: `${user.profile.displayName} plays ${user.userGames.map((entry) => entry.game.name).join(", ")} with ${trust?.tier ?? "Developing"} trust confidence on Raidbase.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  const user = await db.user.findUnique({
    where: {
      username: username.toLowerCase(),
    },
    include: {
      profile: true,
      userGames: {
        include: {
          game: true,
        },
      },
      clips: {
        where: {
          visibility: "public",
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 6,
      },
      reputation: true,
    },
  });

  if (!user?.profile) {
    notFound();
  }

  const trust = user.reputation
    ? buildTrustSummary({
        reliabilityScore: user.reputation.reliabilityScore,
        commsScore: user.reputation.commsScore,
        skillScore: user.reputation.skillScore,
        teamBehaviorScore: user.reputation.teamBehaviorScore,
        toxicityRisk: user.reputation.toxicityRisk,
        reviewCount: user.reputation.reviewCount,
        uniqueReviewers: user.reputation.uniqueReviewers,
        publicBadges: user.reputation.publicBadges,
      })
    : buildTrustSummary({
        reliabilityScore: 0,
        commsScore: 0,
        skillScore: 0,
        teamBehaviorScore: 0,
        toxicityRisk: 0,
        reviewCount: 0,
        uniqueReviewers: 0,
        publicBadges: [],
      });

  const primaryGame = user.userGames[0];
  const tagline = user.profile.bio ?? "Building squad chemistry one session at a time.";
  const publicBadges = trust.publicBadges.length > 0 ? trust.publicBadges : ["Growing profile"];
  const playType = user.profile.preferredPlayType ?? "Balanced";

  return (
    <SiteShell
      activePath="/profile"
      eyebrow="Player profile"
      title={`${user.profile.displayName} is built for repeat queues, not one-off luck.`}
      description="Profiles combine games, roles, schedule, clips, and trust badges into a gaming resume that helps squads choose people with context instead of hype."
    >
      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="space-y-6">
          <article className="overflow-hidden rounded-[30px] border border-white/10 bg-white/5">
            <div className="h-48 bg-[linear-gradient(135deg,rgba(45,168,255,0.42),rgba(139,92,255,0.26),rgba(5,11,20,0.85))]" />
            <div className="p-6 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-cyan-100">@{user.username}</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{user.profile.displayName}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{tagline}</p>
                </div>
                <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-4 text-center">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-100">Trust score</p>
                  <p className="mt-2 text-4xl font-semibold text-white">{trust.trustScore}</p>
                  <p className="mt-1 text-xs text-cyan-100">{trust.tier}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Swords className="h-4 w-4 text-cyan-200" />
                    Rank and role
                  </p>
                  <p className="text-sm leading-7 text-slate-300">{primaryGame?.rank ?? "Unranked"}</p>
                  <p className="text-sm text-slate-400">{primaryGame?.role ?? "Flex"}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <CalendarRange className="h-4 w-4 text-cyan-200" />
                    Availability
                  </p>
                  <p className="text-sm leading-7 text-slate-300">{user.profile.schedule ?? "Schedule not set"}</p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                    <Headset className="h-4 w-4 text-cyan-200" />
                    Comms
                  </p>
                  <p className="text-sm leading-7 text-slate-300">{user.profile.micPreference}</p>
                  <p className="text-sm text-slate-400">{user.profile.region}</p>
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
              {publicBadges.map((badge) => (
                <span key={badge} className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-sm text-slate-100">
                  {badge}
                </span>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Quality highlights</p>
                <p className="mt-2 text-sm text-slate-200">
                  {trust.highlights.length > 0 ? trust.highlights.join(" • ") : "Growing evidence"}
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Review coverage</p>
                <p className="mt-2 text-sm text-slate-200">
                  {trust.reviewThreshold.reviewCount} reviews • {trust.reviewThreshold.uniqueReviewers} unique reviewers
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              These badges are only shown after the minimum review threshold is met, using structured ratings instead of public negative comment walls. Current play style: {playType}.
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
              {user.userGames.map((entry) => (
                <span key={entry.game.id} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                  {entry.game.name}
                </span>
              ))}
              {user.userGames.length === 0 ? (
                <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-sm text-slate-200">
                  No games linked yet
                </span>
              ) : null}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-cyan-200" />
              <h3 className="text-xl font-semibold text-white">Featured clips</h3>
            </div>
            <div className="mt-4 space-y-3">
              {user.clips.length === 0 ? (
                <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-sm text-slate-300">No clips yet. Add one from the clips page to build proof points.</p>
                </div>
              ) : (
                user.clips.map((clip) => (
                  <div key={clip.id} className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                    <p className="text-sm font-medium text-white">{clip.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {clip.provider} • {clip.visibility} • {Intl.NumberFormat("en-US", { notation: "compact" }).format(clip.viewCount)} views
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </aside>
      </div>
    </SiteShell>
  );
}