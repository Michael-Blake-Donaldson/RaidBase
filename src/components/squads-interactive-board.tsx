"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck, Users2 } from "lucide-react";

import type { SquadCard } from "@/lib/site-data";

const gameChoices = [
  { label: "Valorant", slug: "valorant" },
  { label: "CS2", slug: "cs2" },
  { label: "Destiny 2", slug: "destiny-2" },
  { label: "Apex Legends", slug: "apex-legends" },
  { label: "World of Warcraft", slug: "world-of-warcraft" },
];

type SquadsInteractiveBoardProps = {
  initialSquads: SquadCard[];
  isAuthenticated: boolean;
};

export function SquadsInteractiveBoard({ initialSquads, isAuthenticated }: SquadsInteractiveBoardProps) {
  const [squads, setSquads] = useState(initialSquads);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState<Record<string, boolean>>({});
  const [joinCodes, setJoinCodes] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    gameSlug: "valorant",
    privacy: "PUBLIC" as "PUBLIC" | "PRIVATE" | "INVITE_ONLY",
  });

  async function refreshSquads() {
    const response = await fetch("/api/squads", { method: "GET", cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const payload = (await response.json().catch(() => null)) as { squads?: SquadCard[] } | null;
    if (payload?.squads) {
      setSquads(payload.squads);
    }
  }

  async function onCreateSquad(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isAuthenticated) {
      setError("Sign in first to create a squad.");
      return;
    }

    setIsCreating(true);

    const response = await fetch("/api/squads", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; squad?: { inviteCode?: string | null } }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "Could not create squad.");
      setIsCreating(false);
      return;
    }

    const inviteNote = payload?.squad?.inviteCode ? ` Invite code: ${payload.squad.inviteCode}.` : "";
    setMessage(`Squad created successfully.${inviteNote}`);
    setForm((current) => ({ ...current, name: "", description: "" }));
    setIsCreating(false);
    await refreshSquads();
  }

  async function onJoinSquad(squadId: string) {
    setError(null);
    setMessage(null);
    setIsJoining((current) => ({ ...current, [squadId]: true }));

    const response = await fetch(`/api/squads/${squadId}/members`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ inviteCode: joinCodes[squadId]?.trim() || undefined }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Could not join squad.");
      setIsJoining((current) => ({ ...current, [squadId]: false }));
      return;
    }

    setMessage("Joined squad successfully.");
    setIsJoining((current) => ({ ...current, [squadId]: false }));
    await refreshSquads();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="grid gap-4">
        <article className="border border-cyan-300/20 bg-cyan-300/10 p-6">
          <h2 className="text-2xl font-semibold text-white">Create your squad</h2>
          <p className="mt-2 text-sm text-slate-100">
            This creates a real squad in the database, adds you as owner, and generates an invite code when privacy requires it.
          </p>

          {!isAuthenticated ? (
            <p className="mt-3 text-sm text-cyan-100">
              <Link href="/auth/register" className="font-semibold underline decoration-cyan-200/60 underline-offset-4">
                Create an account
              </Link>{" "}
              or <Link href="/auth/sign-in" className="font-semibold underline decoration-cyan-200/60 underline-offset-4">sign in</Link> to create squads.
            </p>
          ) : null}

          <form className="mt-4 grid gap-3 lg:grid-cols-2" onSubmit={onCreateSquad}>
            <label className="space-y-1 text-xs text-slate-200 lg:col-span-2">
              <span>Squad name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                minLength={3}
                maxLength={40}
                className="w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
                placeholder="Example: Night Circuit Tactical"
              />
            </label>

            <label className="space-y-1 text-xs text-slate-200">
              <span>Game</span>
              <select
                value={form.gameSlug}
                onChange={(event) => setForm((current) => ({ ...current, gameSlug: event.target.value }))}
                className="w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
              >
                {gameChoices.map((choice) => (
                  <option key={choice.slug} value={choice.slug}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs text-slate-200">
              <span>Privacy</span>
              <select
                value={form.privacy}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    privacy: event.target.value as "PUBLIC" | "PRIVATE" | "INVITE_ONLY",
                  }))
                }
                className="w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
              >
                <option value="PUBLIC">Public</option>
                <option value="INVITE_ONLY">Invite only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </label>

            <label className="space-y-1 text-xs text-slate-200 lg:col-span-2">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                maxLength={240}
                className="h-24 w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
                placeholder="What your squad values, plays, and schedules for."
              />
            </label>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={!isAuthenticated || isCreating || form.name.trim().length < 3}
                className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Create squad"}
              </button>
            </div>
          </form>

          {message ? <p className="mt-3 text-sm text-emerald-100">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-rose-100">{error}</p> : null}
        </article>

        {squads.map((squad) => (
          <article key={squad.id} className="border border-white/10 bg-slate-950/30 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">{squad.name}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {squad.game} • {squad.members} active members • {squad.status}
                </p>
              </div>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100">
                {squad.synergy}% synergy
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">{squad.activity}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {squad.openRoles.map((role) => (
                <span key={role} className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs text-slate-200">
                  {role}
                </span>
              ))}
            </div>

            <div className="mt-4 space-y-3 border border-white/10 bg-slate-950/55 p-4">
              <p className="text-xs text-slate-300">
                Privacy: <span className="font-semibold text-white">{squad.privacy}</span>
              </p>

              {squad.inviteCodeRequired ? (
                <input
                  value={joinCodes[squad.id] ?? ""}
                  onChange={(event) => setJoinCodes((current) => ({ ...current, [squad.id]: event.target.value.toUpperCase() }))}
                  placeholder="Enter invite code"
                  className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white"
                />
              ) : null}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => onJoinSquad(squad.id)}
                  disabled={Boolean(isJoining[squad.id])}
                  className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isJoining[squad.id] ? "Joining..." : "Join squad"}
                </button>
              ) : (
                <p className="text-sm text-slate-300">
                  <Link href="/auth/sign-in" className="font-medium text-cyan-100 hover:text-cyan-50">
                    Sign in
                  </Link>{" "}
                  to join this squad.
                </p>
              )}
            </div>
          </article>
        ))}
      </section>

      <aside className="space-y-4 border border-white/10 bg-slate-950/30 p-6 xl:sticky xl:top-28 xl:h-fit">
        <div className="flex items-center gap-3">
          <Users2 className="h-5 w-5 text-cyan-200" />
          <h2 className="text-xl font-semibold text-white">User-first squad controls</h2>
        </div>
        <div className="border border-white/10 bg-slate-950/55 p-4 text-sm leading-7 text-slate-300">
          Users can now create squads, choose privacy, and join immediately when rules allow. Invite-only squads enforce code entry before membership.
        </div>
        <div className="border border-emerald-300/20 bg-emerald-300/10 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-100">
            <ShieldCheck className="h-4 w-4" />
            Safety and trust
          </p>
          <p className="text-sm leading-7 text-slate-200">
            Auth checks, rate limits, duplicate-membership prevention, and privacy-aware join rules are enforced server-side.
          </p>
        </div>
      </aside>
    </div>
  );
}