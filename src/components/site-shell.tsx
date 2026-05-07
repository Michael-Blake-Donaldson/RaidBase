import Link from "next/link";
import Image from "next/image";
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
    <div className="rb-page">
      <main id="main-content" className="mx-auto min-h-screen w-full max-w-[1720px] px-5 py-5 lg:px-8">
        <header className="rb-shell rounded-[28px] px-5 py-4 lg:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/raidbaselogo-transparent.png"
                  alt="Raidbase"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-2xl"
                  priority
                />
                <p className="rb-text-strong font-display text-3xl tracking-tight">Raidbase</p>
              </Link>
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
                          : "rb-button-secondary"
                      }`}
                    >
                      {item.label}
                      {item.badge ? (
                        <span className="rb-pill rounded-full px-1.5 py-0.5 text-[10px]">{item.badge}</span>
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
              <button type="button" className="rb-button-secondary rounded-full p-2">
                <Bell className="h-4 w-4" />
              </button>
              <button type="button" className="rb-button-secondary rounded-full p-1.5">
                <UserCircle2 className="h-7 w-7" />
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="rb-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold">{eyebrow}</p>
              <h1 className="rb-text-strong mt-3 text-3xl font-semibold tracking-tight lg:text-5xl">{title}</h1>
              <p className="rb-text-body mt-2 max-w-3xl text-sm leading-7 lg:text-base">{description}</p>
            </div>

            <div className="rb-panel rounded-2xl px-4 py-3 text-sm">
              <p className="rb-text-muted text-xs uppercase tracking-[0.15em]">Live briefing</p>
              <p className="rb-text-strong mt-1 font-medium">Queue confidence: 92% • Team stability: High</p>
            </div>
          </div>
        </header>

        <MotionFade className="mt-5" delay={0.06}>
          {children}
        </MotionFade>

        <div className="rb-text-muted mt-5 flex flex-col gap-4 border-t border-gray-300 px-2 py-4 text-xs lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Bell className="rb-text-strong h-4 w-4" />
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
