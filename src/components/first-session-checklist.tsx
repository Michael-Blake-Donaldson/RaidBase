"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

const STORAGE_KEY = "raidbase-first-session-checklist";

type ChecklistStep = {
  id: string;
  label: string;
  hint: string;
  href: string;
};

const defaultSteps: ChecklistStep[] = [
  {
    id: "profile",
    label: "Complete profile preferences",
    hint: "Region, timezone, mic, and schedule tighten match quality immediately.",
    href: "/settings",
  },
  {
    id: "lfg",
    label: "Review active LFG opportunities",
    hint: "Join a post with role, schedule, and tone compatibility.",
    href: "/lfg",
  },
  {
    id: "trust",
    label: "Check trust signals on a profile",
    hint: "Use fit scores and badges before sending invites.",
    href: "/profile/ghosttrace",
  },
];

type FirstSessionChecklistProps = {
  username?: string;
};

export function FirstSessionChecklist({ username }: FirstSessionChecklistProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    try {
      return JSON.parse(raw) as Record<string, boolean>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const completedCount = useMemo(
    () => defaultSteps.filter((step) => completed[step.id]).length,
    [completed],
  );

  const allComplete = completedCount === defaultSteps.length;

  return (
    <section className="rounded-[28px] border border-gray-400/30 bg-gray-900/60 p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">First-session success path</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {username ? `${username}, start here` : "Start here"}
          </h3>
        </div>
        <span className="rounded-full border border-blue-400/40 bg-blue-600/30 px-3 py-1 text-xs font-medium text-blue-100">
          {completedCount}/{defaultSteps.length} complete
        </span>
      </div>

      <div className="space-y-3">
        {defaultSteps.map((step) => {
          const done = Boolean(completed[step.id]);

          return (
            <div key={step.id} className="rounded-2xl border border-gray-400/25 bg-gray-800/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  {done ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" aria-hidden />
                  ) : (
                    <Circle className="mt-0.5 h-5 w-5 text-gray-500" aria-hidden />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{step.label}</p>
                    <p className="mt-1 text-xs leading-6 text-gray-300">{step.hint}</p>
                  </div>
                </div>
                <Link
                  href={step.href}
                  className="whitespace-nowrap rounded-full border border-blue-400/40 bg-blue-600/25 px-3 py-1.5 text-xs text-blue-100 transition hover:border-blue-300/60 hover:bg-blue-600/40"
                >
                  Open
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setCompleted((current) => ({ ...current, [step.id]: !done }))}
                className="mt-3 text-xs text-gray-300 transition hover:text-white"
              >
                {done ? "Mark incomplete" : "Mark complete"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
        {allComplete ? (
          <p className="inline-flex items-center gap-2">
            <Sparkles className="h-4 w-4" aria-hidden />
            Core setup complete. You are ready for high-confidence invites and recurring squads.
          </p>
        ) : (
          <p>Complete this path once and Raidbase can prioritize better recommendations from your next session onward.</p>
        )}
      </div>
    </section>
  );
}