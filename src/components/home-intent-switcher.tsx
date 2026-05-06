"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Crosshair, Sparkles, Users } from "lucide-react";

type IntentMode = "solo" | "duo" | "squad";

type HomeIntentSwitcherProps = {
  playerCount: number;
  lfgCount: number;
  squadCount: number;
};

const STORAGE_KEY = "raidbase-home-intent-mode";

export function HomeIntentSwitcher({ playerCount, lfgCount, squadCount }: HomeIntentSwitcherProps) {
  const [mode, setMode] = useState<IntentMode>(() => {
    if (typeof window === "undefined") {
      return "duo";
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "solo" || raw === "duo" || raw === "squad") {
      return raw;
    }

    return "duo";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const summary = useMemo(() => {
    if (mode === "solo") {
      return {
        title: "Solo grind mode",
        body: "Bias toward quick, low-friction queues and one high-confidence teammate.",
        primaryHref: "/lfg",
        primaryLabel: "Find instant LFG",
        secondaryHref: "/profile/ghosttrace",
        secondaryLabel: "Review top solo-fit player",
        stat: `${Math.min(2, Math.max(1, lfgCount))} fast-join opportunities right now`,
      };
    }

    if (mode === "squad") {
      return {
        title: "Full squad mode",
        body: "Prioritize persistent teams and role-complete group sessions for repeat performance.",
        primaryHref: "/squads",
        primaryLabel: "Open recruiting squads",
        secondaryHref: "/settings",
        secondaryLabel: "Refine role coverage",
        stat: `${Math.min(3, Math.max(1, squadCount))} stable squads fit your current profile`,
      };
    }

    return {
      title: "Duo queue mode",
      body: "Pair one trusted teammate with a matching LFG post to stay flexible.",
      primaryHref: "/lfg",
      primaryLabel: "Find duo-ready LFG",
      secondaryHref: "/profile/ghosttrace",
      secondaryLabel: "Open teammate shortlist",
      stat: `${Math.min(3, Math.max(1, playerCount))} teammate matches and ${Math.min(3, Math.max(1, lfgCount))} LFG fits`,
    };
  }, [lfgCount, mode, playerCount, squadCount]);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">Intent mode</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Adaptive command focus</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
          <Sparkles className="h-4 w-4" />
          {summary.stat}
        </span>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setMode("solo")}
          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
            mode === "solo"
              ? "border-cyan-300/40 bg-cyan-300/12 text-white"
              : "border-white/10 bg-slate-950/45 text-slate-300 hover:border-cyan-300/25"
          }`}
        >
          Solo grind
        </button>
        <button
          type="button"
          onClick={() => setMode("duo")}
          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
            mode === "duo"
              ? "border-cyan-300/40 bg-cyan-300/12 text-white"
              : "border-white/10 bg-slate-950/45 text-slate-300 hover:border-cyan-300/25"
          }`}
        >
          Duo queue
        </button>
        <button
          type="button"
          onClick={() => setMode("squad")}
          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
            mode === "squad"
              ? "border-cyan-300/40 bg-cyan-300/12 text-white"
              : "border-white/10 bg-slate-950/45 text-slate-300 hover:border-cyan-300/25"
          }`}
        >
          Full squad
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-white">
          <Crosshair className="h-4 w-4 text-cyan-100" />
          {summary.title}
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-300">{summary.body}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={summary.primaryHref}
            className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            {summary.primaryLabel}
          </Link>
          <Link
            href={summary.secondaryHref}
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/10"
          >
            {summary.secondaryLabel}
            <Users className="h-3.5 w-3.5 text-cyan-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}
