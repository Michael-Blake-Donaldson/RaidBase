import Link from "next/link";
import { Bell, ChevronRight, ShieldCheck, Users, Zap } from "lucide-react";
import type { ReactNode } from "react";

import { CommandPalette } from "@/components/command-palette";
import { MotionFade } from "@/components/motion-fade";
import { NotificationsTray } from "@/components/notifications-tray";
import { navItems, notificationItems } from "@/lib/site-data";
import { siteConfig } from "@/lib/site-config";

type SiteShellProps = {
  activePath: string;
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
};

function isActive(activePath: string, href: string) {
  if (href === "/") {
    return activePath === "/";
  }

  return activePath.startsWith(href);
}

export function SiteShell({
  activePath,
  title,
  eyebrow,
  description,
  children,
}: SiteShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_-18%,_rgba(127,159,106,0.24),_transparent_36%),radial-gradient(circle_at_90%_0%,_rgba(137,117,168,0.16),_transparent_30%),radial-gradient(circle_at_76%_34%,_rgba(199,165,106,0.12),_transparent_32%),linear-gradient(180deg,#0d0f11_0%,#121417_58%,#0b0d10_100%)] text-slate-100">
      <div className="flex min-h-screen w-full">
        <aside className="hidden h-screen w-72 shrink-0 border-r border-white/10 bg-black/28 p-5 backdrop-blur xl:flex xl:flex-col">
          <div className="rb-surface mb-8 flex items-center gap-3 rounded-2xl p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#7f9f6a,#c7a56a)] text-[1.15rem] font-black tracking-[0.35em] text-slate-950">
              RB
            </div>
            <div>
              <p className="font-display text-lg tracking-[0.08em] text-[#dce8c7]">
                Raidbase
              </p>
              <p className="text-sm text-slate-300">Tactical squad ecosystem</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(activePath, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-colors ${
                    active
                      ? "border border-[#a5b67b]/45 bg-[#7f9f6a]/16 text-white"
                      : "border border-transparent bg-white/0 text-slate-300 hover:border-white/10 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full border border-white/10 bg-white/8 px-2 py-0.5 text-xs text-[#d7d8b6]">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="rb-surface mt-auto space-y-4 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#a5d2a3]" />
              <div>
                <p className="text-sm font-semibold text-white">Trust layer live</p>
                <p className="text-xs text-slate-400">Anti-brigading and verified sessions enabled</p>
              </div>
            </div>
            <div className="grid gap-3 text-xs leading-6 text-slate-300">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="mb-1 flex items-center gap-2 text-[#d8debb]">
                  <Users className="h-4 w-4" />
                  Squad fit engine
                </p>
                <p>Schedule, rank, role, region, comms, and reputation blended into one fit score.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="mb-1 flex items-center gap-2 text-[#d8debb]">
                  <Zap className="h-4 w-4" />
                  Pro tier
                </p>
                <p>Profile themes, expanded clips, analytics, and boosted discovery at $5/month.</p>
              </div>
            </div>
          </div>
        </aside>

        <main id="main-content" className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,rgba(24,27,31,0.62)_0%,rgba(13,15,17,0.9)_100%)]">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/35 px-5 py-4 backdrop-blur lg:px-8">
            <div className="mb-4 flex gap-2 overflow-x-auto xl:hidden">
              {navItems.map((item) => {
                const active = isActive(activePath, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition ${
                      active
                        ? "border border-[#a5b67b]/45 bg-[#7f9f6a]/18 text-white"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:border-[#a5b67b]/30 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-5 2xl:grid-cols-[1fr_auto] 2xl:items-start">
              <div className="max-w-5xl">
                <div className="rb-chip mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
                  {eyebrow}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="rb-gradient-text font-display text-3xl font-semibold tracking-tight lg:text-5xl">
                    {title}
                  </h1>
                  <span className="rounded-full border border-[#a5d2a3]/28 bg-[#7ab896]/12 px-3 py-1 text-xs font-medium text-[#cfe7c9]">
                    Desktop-first MVP
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                  {description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 2xl:min-w-[420px]">
                <div className="rb-surface rounded-xl p-4">
                  <p className="text-xs text-slate-400">Live state</p>
                  <p className="mt-2 text-lg font-semibold text-white">24 matching posts in your queue</p>
                  <p className="mt-1 text-sm text-slate-400">Fresh filters synced to region, rank, and comms.</p>
                </div>
                <div className="rb-surface-strong rounded-xl p-4">
                  <p className="text-xs text-[#d8e1bf]">Next action</p>
                  <p className="mt-2 text-lg font-semibold text-white">Finish profile and unlock trust badges</p>
                  <div className="mt-2 flex items-center text-sm text-[#d8e1bf]">
                    Review threshold progress
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 h-1.5 w-full rounded-full bg-[linear-gradient(90deg,rgba(127,159,106,0.85)_0%,rgba(199,165,106,0.7)_43%,rgba(137,117,168,0.75)_100%)]" />

            <div className="mt-4 flex flex-wrap gap-2">
              <NotificationsTray items={notificationItems} />
              <CommandPalette navItems={navItems} />
              <Link
                href="/auth/sign-in"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:border-[#a5b67b]/35 hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-full border border-[#a5b67b]/35 bg-[#7f9f6a]/14 px-4 py-2 text-xs font-medium text-[#dce8c7] transition hover:bg-[#7f9f6a]/24"
              >
                Create account
              </Link>
            </div>
          </header>

          <div className="flex flex-1 min-h-0">
            <MotionFade className="min-w-0 flex-1 px-5 py-6 lg:px-8" delay={0.06}>
              {children}
            </MotionFade>

            <aside className="hidden w-[340px] shrink-0 border-l border-white/10 bg-black/24 p-5 2xl:block">
              <div className="rb-surface rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Context rail</p>
                <h2 className="mt-2 text-lg font-semibold text-white">Live operation focus</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-[#d8e1bf]">Session Pressure</p>
                    <p className="mt-1 text-lg font-semibold text-white">67%</p>
                    <p className="text-xs text-slate-400">Most active queue window: next 90 minutes</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-[#d8e1bf]">Squad Stability</p>
                    <p className="mt-1 text-lg font-semibold text-white">4 teams recruiting</p>
                    <p className="text-xs text-slate-400">Invite-only groups increased 18% this week</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs text-[#d8e1bf]">Signal Timeline</p>
                    <ul className="mt-2 space-y-2 text-xs text-slate-300">
                      <li className="rounded-lg bg-black/20 px-2 py-1.5">4m: new trust badge unlocked</li>
                      <li className="rounded-lg bg-black/20 px-2 py-1.5">8m: squad invite accepted</li>
                      <li className="rounded-lg bg-black/20 px-2 py-1.5">12m: LFG activity spike</li>
                    </ul>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-4 text-xs text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#d7d8b6]" />
              In-app notifications, moderation, billing, and safety controls are wired into the MVP shell.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link href={siteConfig.links.privacy} className="transition hover:text-white">
                Privacy
              </Link>
              <Link href={siteConfig.links.terms} className="transition hover:text-white">
                Terms
              </Link>
              <p>Built for competitive PC sessions, not generic chat.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
