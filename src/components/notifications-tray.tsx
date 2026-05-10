"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCircle2, Clock3, X } from "lucide-react";

import type { NotificationItem } from "@/lib/site-data";

type NotificationsTrayProps = {
  items: NotificationItem[];
};

type NotificationState = "open" | "accepted" | "snoozed" | "dismissed";
type NotificationStateMap = Record<string, NotificationState>;

const STORAGE_KEY = "raidbase-notifications-tray-state";

const priorityWeight: Record<NotificationItem["priority"], number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

function timeAgo(fromIso: string, nowMs: number) {
  const createdMs = new Date(fromIso).getTime();

  if (Number.isNaN(createdMs)) {
    return "recent";
  }

  const diffMs = Math.max(0, nowMs - createdMs);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function categoryLabel(category: NotificationItem["category"]) {
  if (category === "invite") {
    return "Invite";
  }

  if (category === "trust") {
    return "Trust";
  }

  if (category === "billing") {
    return "Billing";
  }

  return "Content";
}

function priorityBadge(priority: NotificationItem["priority"]) {
  if (priority === "High") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (priority === "Medium") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

export function NotificationsTray({ items }: NotificationsTrayProps) {
  const [open, setOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [liveItems, setLiveItems] = useState(items);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [states, setStates] = useState<NotificationStateMap>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as NotificationStateMap;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  }, [states]);

  const refreshFromServer = useCallback(async (showSpinner?: boolean) => {
    if (showSpinner) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { items?: NotificationItem[] };
      if (Array.isArray(data.items)) {
        setLiveItems(data.items);
      }
    } catch {
      // Polling failures are non-fatal; keep local notification state.
    } finally {
      if (showSpinner) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
      void refreshFromServer();
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [refreshFromServer]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!containerRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [open]);

  const mutateNotification = useCallback(async (notificationId: string, action: "accept" | "dismiss" | "open") => {
    await fetch(`/api/notifications/${notificationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    }).catch(() => undefined);
  }, []);

  const itemState = useCallback(
    (item: NotificationItem) => {
      const local = states[item.id];
      if (local) {
        return local;
      }

      return item.resolved ? "accepted" : "open";
    },
    [states],
  );

  const activeItems = useMemo(
    () => liveItems.filter((item) => {
      const state = itemState(item);
      return state !== "dismissed";
    }),
    [itemState, liveItems],
  );

  const unresolvedCount = useMemo(
    () => activeItems.filter((item) => {
      const state = itemState(item);
      return state === "open" || state === "snoozed";
    }).length,
    [activeItems, itemState],
  );

  const acceptedCount = useMemo(
    () => activeItems.filter((item) => itemState(item) === "accepted").length,
    [activeItems, itemState],
  );

  const sortedItems = useMemo(() => {
    return [...activeItems].sort((a, b) => {
      const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activeItems]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (next) {
              void refreshFromServer(true);
            }
            return next;
          });
        }}
        className="rb-button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition"
      >
        <Bell className="rb-icon h-3.5 w-3.5" aria-hidden />
        Notifications
        <span className="rb-badge-info rounded-full px-2 py-0.5 text-[10px]">
          {unresolvedCount}
        </span>
      </button>

      {open ? (
        <div className="rb-overlay absolute right-0 z-50 mt-2 w-[min(92vw,30rem)] rounded-2xl p-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between px-1 py-1">
            <div>
              <p className="rb-text-muted text-xs">Actionable notifications</p>
              <h3 className="rb-text-strong text-sm font-semibold">Resolve in place</h3>
              <p className="rb-text-muted mt-1 text-[11px]">
                {unresolvedCount} unresolved • {acceptedCount} accepted
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isRefreshing}
                onClick={() => void refreshFromServer(true)}
                className="rb-button-subtle rounded-full px-2.5 py-1 text-[11px] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                type="button"
                onClick={() =>
                  setStates((current) => {
                    const next = { ...current };
                    for (const item of activeItems) {
                      if (itemState(item) !== "dismissed") {
                        next[item.id] = "accepted";
                        if (item.persisted) {
                          void mutateNotification(item.id, "accept");
                        }
                      }
                    }
                    return next;
                  })
                }
                className="rb-badge-success rounded-full px-2.5 py-1 text-[11px] transition"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => setStates({})}
                className="rb-button-secondary rounded-full px-2.5 py-1 text-[11px] transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rb-button-secondary rounded-md p-1 transition"
                aria-label="Close notifications tray"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {activeItems.length === 0 ? (
              <div className="rb-badge-success rounded-xl border border-dashed p-4 text-sm">
                All notifications cleared.
              </div>
            ) : null}

            {sortedItems.map((item) => {
              const state = itemState(item);

              return (
                <article key={item.id} className="rb-surface-soft rounded-xl p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="rb-text-strong text-sm font-medium">{item.title}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${priorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>

                  <p className="rb-text-body text-xs leading-6">{item.detail}</p>

                  <div className="rb-text-muted mt-2 flex items-center gap-2 text-[11px]">
                    <span className="rb-pill rounded-full px-2 py-0.5">
                      {categoryLabel(item.category)}
                    </span>
                    <span>{timeAgo(item.createdAt, nowMs)}</span>
                    <span>Status: {state}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (item.persisted) {
                          void mutateNotification(item.id, "open");
                        }
                        setOpen(false);
                      }}
                      className="rb-button-subtle rounded-full px-3 py-1.5 text-xs font-medium transition"
                    >
                      Open
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setStates((current) => ({ ...current, [item.id]: "accepted" }));
                        if (item.persisted) {
                          void mutateNotification(item.id, "accept");
                        }
                      }}
                      className="rb-badge-success inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setStates((current) => ({
                          ...current,
                          [item.id]: state === "snoozed" ? "open" : "snoozed",
                        }))
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-medium text-amber-100 transition hover:bg-amber-300/20"
                    >
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      {state === "snoozed" ? "Unsnooze" : "Snooze"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStates((current) => ({ ...current, [item.id]: "dismissed" }));
                        if (item.persisted) {
                          void mutateNotification(item.id, "dismiss");
                        }
                      }}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
