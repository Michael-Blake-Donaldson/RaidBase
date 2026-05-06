"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Command, Compass, Gamepad2, Layers, Search, Users, X } from "lucide-react";

type CommandPaletteProps = {
  navItems: Array<{
    label: string;
    href: string;
  }>;
};

type CommandAction = {
  id: string;
  label: string;
  hint: string;
  href?: string;
  icon: "nav" | "lfg" | "squads" | "profile" | "focus";
  onRun?: () => void;
};

function ActionIcon({ icon }: { icon: CommandAction["icon"] }) {
  if (icon === "lfg") {
    return <Gamepad2 className="h-4 w-4 text-cyan-100" aria-hidden />;
  }

  if (icon === "squads") {
    return <Layers className="h-4 w-4 text-cyan-100" aria-hidden />;
  }

  if (icon === "profile") {
    return <Users className="h-4 w-4 text-cyan-100" aria-hidden />;
  }

  if (icon === "focus") {
    return <Compass className="h-4 w-4 text-cyan-100" aria-hidden />;
  }

  return <Command className="h-4 w-4 text-cyan-100" aria-hidden />;
}

function getImmersiveState() {
  if (typeof window === "undefined") {
    return false;
  }

  return document.documentElement.dataset.rbImmersive === "on";
}

export function CommandPalette({ navItems }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [immersive, setImmersive] = useState(() => getImmersiveState());

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const openPalette = useCallback(() => {
    setOpen(true);
    setQuery("");
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        if (open) {
          closePalette();
        } else {
          openPalette();
        }
      }

      if (event.key === "Escape") {
        closePalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePalette, open, openPalette]);

  const actions = useMemo<CommandAction[]>(() => {
    const navActions = navItems.map((item) => ({
      id: `nav-${item.href}`,
      label: `Go to ${item.label}`,
      hint: item.href,
      href: item.href,
      icon: "nav" as const,
    }));

    const quickActions: CommandAction[] = [
      {
        id: "lfg-join",
        label: "Open LFG board",
        hint: "Find live session opportunities",
        href: "/lfg",
        icon: "lfg",
      },
      {
        id: "squads-open",
        label: "Open squads",
        hint: "Browse persistent teams",
        href: "/squads",
        icon: "squads",
      },
      {
        id: "profile-sample",
        label: "Review profile benchmark",
        hint: "Open profile quality reference",
        href: "/profile/ghosttrace",
        icon: "profile",
      },
      {
        id: "immersive-toggle",
        label: immersive ? "Disable cinematic mode" : "Enable cinematic mode",
        hint: "Toggle full-window ambience",
        icon: "focus",
        onRun: () => {
          const nextValue = !getImmersiveState();
          document.documentElement.dataset.rbImmersive = nextValue ? "on" : "off";
          setImmersive(nextValue);
          closePalette();
        },
      },
    ];

    return [...quickActions, ...navActions];
  }, [closePalette, immersive, navItems]);

  const filteredActions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return actions;
    }

    return actions.filter((action) => {
      return action.label.toLowerCase().includes(normalized) || action.hint.toLowerCase().includes(normalized);
    });
  }, [actions, query]);

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/10"
      >
        <Command className="h-3.5 w-3.5 text-cyan-100" aria-hidden />
        Command menu
        <span className="rounded border border-white/20 bg-slate-950/70 px-1.5 py-0.5 text-[10px] text-slate-300">
          Ctrl+K
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 p-4 pt-[12vh] backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-cyan-300/25 bg-slate-950/94 shadow-[0_30px_80px_rgba(1,8,18,0.6)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 text-cyan-100" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search destinations and quick actions..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-white/15 bg-white/5 p-1 text-slate-200 transition hover:text-white"
                aria-label="Close command palette"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-3">
              {filteredActions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
                  No command matches that search.
                </div>
              ) : null}

              <div className="space-y-2">
                {filteredActions.map((action) => {
                  if (action.href) {
                    return (
                      <Link
                        key={action.id}
                        href={action.href}
                        onClick={closePalette}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                      >
                        <div className="flex items-center gap-3">
                          <ActionIcon icon={action.icon} />
                          <div>
                            <p>{action.label}</p>
                            <p className="text-xs text-slate-400">{action.hint}</p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">Enter</span>
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={action.onRun}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-sm text-white transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                    >
                      <div className="flex items-center gap-3">
                        <ActionIcon icon={action.icon} />
                        <div>
                          <p>{action.label}</p>
                          <p className="text-xs text-slate-400">{action.hint}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">Run</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
