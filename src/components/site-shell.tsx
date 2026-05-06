import Link from "next/link";
import { Bell, ChevronRight, ShieldCheck, Users, Zap } from "lucide-react";
import type { ReactNode } from "react";

import { MotionFade } from "@/components/motion-fade";
import { navItems } from "@/lib/site-data";
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(54,224,255,0.14),_transparent_34%),linear-gradient(180deg,#07111f_0%,#081426_48%,#050b14_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1500px] gap-5 px-4 py-4 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.3)] backdrop-blur xl:flex xl:flex-col">
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/8 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2da8ff,#36e0ff)] text-[1.15rem] font-black tracking-[0.35em] text-slate-950">
              RB
            </div>
            <div>
              <p className="font-display text-lg tracking-[0.08em] text-cyan-100">
                Raidbase
              </p>
              <p className="text-sm text-slate-300">PC squad ecosystem</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(activePath, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-colors ${
                    active
                      ? "border border-cyan-300/35 bg-cyan-400/12 text-white shadow-[inset_0_0_0_1px_rgba(54,224,255,0.15)]"
                      : "border border-transparent bg-white/0 text-slate-300 hover:border-white/10 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full border border-white/10 bg-white/8 px-2 py-0.5 text-xs text-cyan-100">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4 rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold text-white">Trust layer live</p>
                <p className="text-xs text-slate-400">Anti-brigading and verified sessions enabled</p>
              </div>
            </div>
            <div className="grid gap-3 text-xs leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="mb-1 flex items-center gap-2 text-cyan-100">
                  <Users className="h-4 w-4" />
                  Squad fit engine
                </p>
                <p>Schedule, rank, role, region, comms, and reputation blended into one fit score.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="mb-1 flex items-center gap-2 text-cyan-100">
                  <Zap className="h-4 w-4" />
                  Pro tier
                </p>
                <p>Profile themes, expanded clips, analytics, and boosted discovery at $5/month.</p>
              </div>
            </div>
          </div>
        </aside>

        <main id="main-content" className="flex-1 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(19,36,58,0.88)_0%,rgba(7,17,31,0.96)_100%)] shadow-[0_20px_75px_rgba(0,0,0,0.34)] backdrop-blur">
          <div className="border-b border-white/10 px-5 py-4 lg:px-8">
            <div className="mb-4 flex gap-2 overflow-x-auto xl:hidden">
              {navItems.map((item) => {
                const active = isActive(activePath, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition ${
                      active
                        ? "border border-cyan-300/35 bg-cyan-300/12 text-white"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/20 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-4xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  {eyebrow}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-3xl font-semibold tracking-tight text-white lg:text-5xl">
                    {title}
                  </h1>
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    Desktop-first MVP
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 lg:text-base">
                  {description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[330px]">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Live state</p>
                  <p className="mt-2 text-lg font-semibold text-white">24 matching posts in your queue</p>
                  <p className="mt-1 text-sm text-slate-400">Fresh filters synced to region, rank, and comms.</p>
                </div>
                <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4">
                  <p className="text-xs text-cyan-100">Next action</p>
                  <p className="mt-2 text-lg font-semibold text-white">Finish profile and unlock trust badges</p>
                  <div className="mt-2 flex items-center text-sm text-cyan-100">
                    Review threshold progress
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <MotionFade className="px-5 py-6 lg:px-8" delay={0.06}>
            {children}
          </MotionFade>

          <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-4 text-xs text-slate-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-cyan-200" />
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