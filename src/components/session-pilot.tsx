"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Compass, MonitorPlay, Sparkles, Timer, Waves } from "lucide-react";

const STORAGE_KEY = "raidbase-session-pilot";

type FocusMode = "competitive" | "balanced" | "chill";
type SessionLength = "45" | "90" | "180";

type SessionPilotProps = {
  username?: string;
  regionHint?: string;
  timezoneHint?: string;
  recommendedCount: number;
  lfgCount: number;
  squadCount: number;
};

type PilotState = {
  focus: FocusMode;
  length: SessionLength;
  immersive: boolean;
};

const defaultState: PilotState = {
  focus: "balanced",
  length: "90",
  immersive: false,
};

function formatLength(length: SessionLength) {
  if (length === "45") {
    return "45 minutes";
  }

  if (length === "180") {
    return "3 hours";
  }

  return "90 minutes";
}

export function SessionPilot({
  username,
  regionHint,
  timezoneHint,
  recommendedCount,
  lfgCount,
  squadCount,
}: SessionPilotProps) {
  const [state, setState] = useState<PilotState>(() => {
    if (typeof window === "undefined") {
      return defaultState;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return defaultState;
    }

    try {
      return {
        ...defaultState,
        ...(JSON.parse(stored) as Partial<PilotState>),
      };
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.rbImmersive = state.immersive ? "on" : "off";

    return () => {
      document.documentElement.dataset.rbImmersive = "off";
    };
  }, [state.immersive]);

  const plan = useMemo(() => {
    const prepLine =
      state.focus === "competitive"
        ? "Open the freshest LFGs first and fill missing roles fast."
        : state.focus === "chill"
          ? "Prioritize tone-compatible groups and low-friction queues."
          : "Blend high-fit players with one open LFG post for flexibility.";

    const teammateLine =
      state.focus === "competitive"
        ? `Shortlist ${Math.min(3, Math.max(1, recommendedCount))} top-synergy players.`
        : state.focus === "chill"
          ? `Invite ${Math.min(2, Math.max(1, recommendedCount))} communication-safe players.`
          : `Review ${Math.min(4, Math.max(1, recommendedCount))} suggested teammates.`;

    const squadLine =
      squadCount > 0
        ? `Check ${Math.min(2, squadCount)} active squads for stable long-session options.`
        : "No active squads detected, rely on LFG for this session.";

    const matchLine =
      lfgCount > 0
        ? `Pick from ${Math.min(5, lfgCount)} relevant LFG opportunities before queueing.`
        : "No open LFG posts yet, widen timing or rank bands in Settings.";

    return [prepLine, teammateLine, squadLine, matchLine];
  }, [lfgCount, recommendedCount, squadCount, state.focus]);

  return (
    <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <article className="rb-panel rounded-[28px] p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-[#5f6772]">Session pilot</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#12161a]">
              {username ? `${username}, shape tonight\'s runbook` : "Shape your runbook"}
            </h3>
            <p className="mt-2 text-sm text-[#3f4852]">
              Use focus controls to generate a practical action path from your current recommendations.
            </p>
          </div>
          <span className="rb-chip-dark inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs">
            <Compass className="h-4 w-4" />
            {formatLength(state.length)} plan
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="rounded-2xl border border-gray-300 bg-white p-3 text-xs text-[#6b7280]">
            Focus
            <select
              value={state.focus}
              onChange={(event) => setState((current) => ({ ...current, focus: event.target.value as FocusMode }))}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#0d1117]"
            >
              <option value="competitive">Competitive</option>
              <option value="balanced">Balanced</option>
              <option value="chill">Chill</option>
            </select>
          </label>

          <label className="rounded-2xl border border-gray-300 bg-white p-3 text-xs text-[#6b7280]">
            Session length
            <select
              value={state.length}
              onChange={(event) => setState((current) => ({ ...current, length: event.target.value as SessionLength }))}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#0d1117]"
            >
              <option value="45">45 min warm-up</option>
              <option value="90">90 min core session</option>
              <option value="180">3 hour grind</option>
            </select>
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-gray-300 bg-white p-3 text-xs text-[#6b7280]">
            Cinematic mode
            <button
              type="button"
              role="switch"
              aria-checked={state.immersive}
              onClick={() => setState((current) => ({ ...current, immersive: !current.immersive }))}
              className={`relative inline-flex h-7 w-12 items-center rounded-full border transition ${
                state.immersive
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-300 bg-white"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-gray-200 transition ${
                  state.immersive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>
        </div>

        <div className="mt-5 rounded-2xl border border-black/10 bg-white/72 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#11161a]">
            <Timer className="h-4 w-4 text-[#11161a]" />
            Suggested run order
          </p>
          <ol className="space-y-2 text-sm text-[#3e4751]">
            {plan.map((line) => (
              <li key={line} className="rounded-xl border border-black/10 bg-white px-3 py-2">
                {line}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/lfg"
            className="rb-chip-dark rounded-full px-4 py-2 text-sm font-semibold"
          >
            Launch LFG board
          </Link>
          <Link
            href="/squads"
            className="rounded-full border border-black/15 bg-white/80 px-4 py-2 text-sm font-medium text-[#11161a] transition hover:border-black/25"
          >
            Open squads
          </Link>
          <Link
            href="/settings"
            className="rounded-full border border-black/15 bg-white/80 px-4 py-2 text-sm font-medium text-[#11161a] transition hover:border-black/25"
          >
            Tune preferences
          </Link>
        </div>
      </article>

      <article className="rb-panel rounded-[28px] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#101418]">Context lane</h3>
          <Waves className="h-5 w-5 text-[#101418]" />
        </div>
        <div className="space-y-3 text-sm text-[#3e4751]">
          <div className="rounded-2xl border border-black/10 bg-white/75 p-4">
            <p className="text-xs text-[#5f6772]">Region priority</p>
            <p className="mt-1 font-medium text-[#12161a]">{regionHint ?? "Set your region in Settings"}</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/75 p-4">
            <p className="text-xs text-[#5f6772]">Timezone anchor</p>
            <p className="mt-1 font-medium text-[#12161a]">{timezoneHint ?? "Set your timezone for better overlap"}</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/75 p-4">
            <p className="text-xs text-[#5f6772]">Current recommendation volume</p>
            <p className="mt-1 inline-flex items-center gap-2 font-medium text-[#12161a]">
              <Sparkles className="h-4 w-4 text-[#12161a]" />
              {recommendedCount} players, {lfgCount} LFG opportunities, {squadCount} squads
            </p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-[#111316] p-4 text-[#edf0f4]">
            <p className="inline-flex items-start gap-2">
              <MonitorPlay className="mt-0.5 h-4 w-4" />
              Cinematic mode persists on this device. Toggle it when you want a full-screen, high-atmosphere session.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
