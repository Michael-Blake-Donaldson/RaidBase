import Link from "next/link";
import { Bell, Search, UserCircle2 } from "lucide-react";
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_0%,rgba(255,255,255,0.8),transparent_40%),linear-gradient(180deg,#dfe3e8_0%,#d8dde3_100%)] text-[#14181d]">
      <main id="main-content" className="mx-auto min-h-screen w-full max-w-[1720px] px-5 py-5 lg:px-8">
        <header className="rb-shell rounded-[28px] px-5 py-4 lg:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <p className="font-display text-3xl tracking-tight text-[#121417]">Raidbase</p>
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => {
                  const active = isActive(activePath, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                        active
                          ? "rb-chip-dark"
                          : "border border-black/10 bg-white/70 text-[#293039] hover:border-black/20"
                      }`}
                    >
                      {item.label}
                      {item.badge ? (
                        <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">{item.badge}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <NotificationsTray items={notificationItems} />
              <CommandPalette navItems={navItems} />
              <button type="button" className="rb-chip-dark rounded-full p-2.5">
                <Search className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-full border border-black/10 bg-white/75 p-2 text-[#15191e]">
                <Bell className="h-4 w-4" />
              </button>
              <button type="button" className="rounded-full border border-black/10 bg-white/75 p-1.5 text-[#15191e]">
                <UserCircle2 className="h-7 w-7" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="rb-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#101418] lg:text-5xl">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#3d4650] lg:text-base">{description}</p>
            </div>

            <div className="rb-panel rounded-2xl px-4 py-3 text-sm text-[#2d353d]">
              <p className="text-xs uppercase tracking-[0.15em] text-[#5c6570]">Live briefing</p>
              <p className="mt-1 font-medium text-[#14181c]">Queue confidence: 92% • Team stability: High</p>
            </div>
          </div>
        </header>

        <MotionFade className="mt-5" delay={0.06}>
          {children}
        </MotionFade>

        <div className="mt-5 flex flex-col gap-4 border-t border-black/10 px-2 py-4 text-xs text-[#4d5762] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[#111316]" />
            In-app notifications, moderation, billing, and safety controls are wired into the MVP shell.
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={siteConfig.links.privacy} className="transition hover:text-[#0f1419]">
              Privacy
            </Link>
            <Link href={siteConfig.links.terms} className="transition hover:text-[#0f1419]">
              Terms
            </Link>
            <p>Built for competitive PC sessions, not generic chat.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
