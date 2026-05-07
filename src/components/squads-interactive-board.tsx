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
        <article className="rb-surface-strong p-6">
          <h2 className="rb-text-strong text-2xl font-semibold">Create your squad</h2>
          <p className="rb-text-body mt-2 text-sm">
            This creates a real squad in the database, adds you as owner, and generates an invite code when privacy requires it.
          </p>

          {!isAuthenticated ? (
            <p className="rb-text-body mt-3 text-sm">
              <Link href="/auth/register" className="font-semibold text-blue-600 underline decoration-blue-300/60 underline-offset-4 dark:text-blue-300">
                Create an account
              </Link>{" "}
              or <Link href="/auth/sign-in" className="font-semibold text-blue-600 underline decoration-blue-300/60 underline-offset-4 dark:text-blue-300">sign in</Link> to create squads.
            </p>
          ) : null}

          <form className="mt-4 grid gap-3 lg:grid-cols-2" onSubmit={onCreateSquad}>
            <label className="rb-text-body space-y-1 text-xs lg:col-span-2">
              <span>Squad name</span>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                minLength={3}
                maxLength={40}
                className="rb-field w-full rounded-xl px-3 py-2 text-sm"
                placeholder="Example: Night Circuit Tactical"
              />
            </label>

            <label className="rb-text-body space-y-1 text-xs">
              <span>Game</span>
              <select
                value={form.gameSlug}
                onChange={(event) => setForm((current) => ({ ...current, gameSlug: event.target.value }))}
                className="rb-field w-full rounded-xl px-3 py-2 text-sm"
              >
                {gameChoices.map((choice) => (
                  <option key={choice.slug} value={choice.slug}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="rb-text-body space-y-1 text-xs">
              <span>Privacy</span>
              <select
                value={form.privacy}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    privacy: event.target.value as "PUBLIC" | "PRIVATE" | "INVITE_ONLY",
                  }))
                }
                className="rb-field w-full rounded-xl px-3 py-2 text-sm"
              >
                <option value="PUBLIC">Public</option>
                <option value="INVITE_ONLY">Invite only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </label>

            <label className="rb-text-body space-y-1 text-xs lg:col-span-2">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                maxLength={240}
                className="rb-field h-24 w-full rounded-xl px-3 py-2 text-sm"
                placeholder="What your squad values, plays, and schedules for."
              />
            </label>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={!isAuthenticated || isCreating || form.name.trim().length < 3}
                className="rb-button-primary rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? "Creating..." : "Create squad"}
              </button>
            </div>
          </form>

          {message ? <p className="mt-3 text-sm text-emerald-100">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-rose-100">{error}</p> : null}
        </article>

        {squads.map((squad) => (
          <article key={squad.id} className="rb-surface-strong p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="rb-text-strong text-2xl font-semibold">{squad.name}</h2>
                <p className="rb-text-muted mt-2 text-sm">
                  {squad.game} • {squad.members} active members • {squad.status}
                </p>
              </div>
              <span className="rb-badge-info rounded-full px-3 py-1 text-sm font-semibold">
                {squad.synergy}% synergy
              </span>
            </div>

            <p className="rb-text-body mt-4 text-sm leading-7">{squad.activity}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {squad.openRoles.map((role) => (
                <span key={role} className="rb-pill rounded-full px-3 py-1 text-xs">
                  {role}
                </span>
              ))}
            </div>

            <div className="rb-surface-soft mt-4 space-y-3 p-4">
              <p className="rb-text-body text-xs">
                Privacy: <span className="rb-text-strong font-semibold">{squad.privacy}</span>
              </p>

              {squad.inviteCodeRequired ? (
                <input
                  value={joinCodes[squad.id] ?? ""}
                  onChange={(event) => setJoinCodes((current) => ({ ...current, [squad.id]: event.target.value.toUpperCase() }))}
                  placeholder="Enter invite code"
                  className="rb-field w-full rounded-xl px-3 py-2 text-sm"
                />
              ) : null}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => onJoinSquad(squad.id)}
                  disabled={Boolean(isJoining[squad.id])}
                  className="rb-button-subtle rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isJoining[squad.id] ? "Joining..." : "Join squad"}
                </button>
              ) : (
                <p className="rb-text-body text-sm">
                  <Link href="/auth/sign-in" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200">
                    Sign in
                  </Link>{" "}
                  to join this squad.
                </p>
              )}
            </div>
          </article>
        ))}
      </section>

      <aside className="rb-surface-strong space-y-4 p-6 xl:sticky xl:top-28 xl:h-fit">
        <div className="flex items-center gap-3">
          <Users2 className="rb-icon h-5 w-5" />
          <h2 className="rb-text-strong text-xl font-semibold">User-first squad controls</h2>
        </div>
        <div className="rb-surface-soft rb-text-body p-4 text-sm leading-7">
          Users can now create squads, choose privacy, and join immediately when rules allow. Invite-only squads enforce code entry before membership.
        </div>
        <div className="rb-badge-success p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            Safety and trust
          </p>
          <p className="text-sm leading-7">
            Auth checks, rate limits, duplicate-membership prevention, and privacy-aware join rules are enforced server-side.
          </p>
        </div>
      </aside>
    </div>
  );
}