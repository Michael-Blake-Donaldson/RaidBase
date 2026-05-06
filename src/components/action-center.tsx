"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock3, RefreshCcw } from "lucide-react";

export type ActionCenterItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: "High" | "Medium" | "Low";
};

type ActionCenterProps = {
  items: ActionCenterItem[];
};

type ItemState = "open" | "done" | "later";

type ItemStateMap = Record<string, ItemState>;

const STORAGE_KEY = "raidbase-action-center-state";

function priorityStyle(priority: ActionCenterItem["priority"]) {
  if (priority === "High") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (priority === "Medium") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
}

export function ActionCenter({ items }: ActionCenterProps) {
  const [states, setStates] = useState<ItemStateMap>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as ItemStateMap;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  }, [states]);

  const visibleItems = useMemo(
    () => items.filter((item) => states[item.id] !== "done"),
    [items, states],
  );

  const completedCount = useMemo(
    () => items.filter((item) => states[item.id] === "done").length,
    [items, states],
  );

  const snoozedCount = useMemo(
    () => items.filter((item) => states[item.id] === "later").length,
    [items, states],
  );

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Action center</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">What to do next</h3>
        </div>
        <Bell className="h-5 w-5 text-cyan-200" />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl border border-white/10 bg-slate-950/50 px-2 py-2 text-slate-300">
          <p className="text-[11px] text-slate-500">Open</p>
          <p className="mt-1 text-sm font-semibold text-white">{visibleItems.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/50 px-2 py-2 text-slate-300">
          <p className="text-[11px] text-slate-500">Snoozed</p>
          <p className="mt-1 text-sm font-semibold text-white">{snoozedCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/50 px-2 py-2 text-slate-300">
          <p className="text-[11px] text-slate-500">Done</p>
          <p className="mt-1 text-sm font-semibold text-white">{completedCount}</p>
        </div>
      </div>

      <div className="space-y-3">
        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-300/30 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            Nice run. You are caught up on every active action.
          </div>
        ) : null}

        {visibleItems.map((item) => {
          const itemState = states[item.id] ?? "open";

          return (
            <div key={item.id} className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[11px] ${priorityStyle(item.priority)}`}>
                  {item.priority}
                </span>
              </div>

              <p className="text-sm leading-6 text-slate-300">{item.detail}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={item.href}
                  className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-300/20"
                >
                  Open
                </Link>

                <button
                  type="button"
                  onClick={() => setStates((current) => ({ ...current, [item.id]: "done" }))}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/20"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  Done
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStates((current) => ({
                      ...current,
                      [item.id]: itemState === "later" ? "open" : "later",
                    }))
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-medium text-amber-100 transition hover:bg-amber-300/20"
                >
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  {itemState === "later" ? "Un-snooze" : "Snooze"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setStates({})}
        className="mt-4 inline-flex items-center gap-2 text-xs text-slate-300 transition hover:text-white"
      >
        <RefreshCcw className="h-3.5 w-3.5" aria-hidden />
        Reset action states
      </button>
    </article>
  );
}
