"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Mic, TimerReset, Users } from "lucide-react";

import type { LfgCard } from "@/lib/site-data";

const gameChoices = [
  { label: "Valorant", slug: "valorant" },
  { label: "CS2", slug: "cs2" },
  { label: "Destiny 2", slug: "destiny-2" },
  { label: "Apex Legends", slug: "apex-legends" },
  { label: "World of Warcraft", slug: "world-of-warcraft" },
];

type LfgInteractiveBoardProps = {
  initialPosts: LfgCard[];
  isAuthenticated: boolean;
};

export function LfgInteractiveBoard({ initialPosts, isAuthenticated }: LfgInteractiveBoardProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [applyState, setApplyState] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    gameSlug: "valorant",
    title: "",
    mode: "Ranked",
    rankMin: "",
    rankMax: "",
    region: "NA Central",
    rolesNeeded: "Controller, Sentinel",
    micRequired: true,
    tone: "Competitive",
    schedule: "Tonight 8PM-11PM",
  });

  const canCreate = useMemo(() => form.title.trim().length >= 8, [form.title]);

  async function refreshPosts() {
    const response = await fetch("/api/lfg/posts", { method: "GET", cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const payload = (await response.json().catch(() => null)) as { posts?: LfgCard[] } | null;
    if (payload?.posts) {
      setPosts(payload.posts);
    }
  }

  async function onCreatePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!isAuthenticated) {
      setError("Sign in first to create a post.");
      return;
    }

    setIsCreating(true);

    const response = await fetch("/api/lfg/posts", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        gameSlug: form.gameSlug,
        title: form.title,
        mode: form.mode,
        rankMin: form.rankMin || undefined,
        rankMax: form.rankMax || undefined,
        region: form.region,
        rolesNeeded: form.rolesNeeded
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        micRequired: form.micRequired,
        tone: form.tone,
        schedule: form.schedule,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Could not create post.");
      setIsCreating(false);
      return;
    }

    setForm((current) => ({ ...current, title: "", rolesNeeded: "Controller, Sentinel" }));
    setMessage("Post created and published to the board.");
    setIsCreating(false);
    await refreshPosts();
  }

  async function onApply(postId: string) {
    setApplyState((current) => ({ ...current, [postId]: true }));
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/lfg/posts/${postId}/applications`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: "Interested in joining. Happy to run a warm-up first." }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Could not submit join request.");
      setApplyState((current) => ({ ...current, [postId]: false }));
      return;
    }

    setMessage("Join request sent.");
    setApplyState((current) => ({ ...current, [postId]: false }));
  }

  return (
    <section className="grid gap-4">
      <article className="border border-cyan-300/20 bg-cyan-300/10 p-5">
        <h2 className="text-xl font-semibold text-white">Create an LFG post</h2>
        <p className="mt-2 text-sm text-slate-100">
          This is live. New posts save to the database and appear in the board immediately.
        </p>

        {!isAuthenticated ? (
          <p className="mt-3 text-sm text-cyan-100">
            <Link href="/auth/register" className="font-semibold underline decoration-cyan-200/60 underline-offset-4">
              Create an account
            </Link>{" "}
            or <Link href="/auth/sign-in" className="font-semibold underline decoration-cyan-200/60 underline-offset-4">sign in</Link> to post.
          </p>
        ) : null}

        <form className="mt-4 grid gap-3 lg:grid-cols-2" onSubmit={onCreatePost}>
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

          <label className="space-y-1 text-xs text-slate-200 lg:col-span-1">
            <span>Mode</span>
            <input
              value={form.mode}
              onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-200 lg:col-span-2">
            <span>Post title</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              minLength={8}
              maxLength={120}
              className="w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
              placeholder="Example: Structured ranked stack pushing for clean comms"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-200">
            <span>Region</span>
            <input
              value={form.region}
              onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-200">
            <span>Schedule</span>
            <input
              value={form.schedule}
              onChange={(event) => setForm((current) => ({ ...current, schedule: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-200">
            <span>Rank min</span>
            <input
              value={form.rankMin}
              onChange={(event) => setForm((current) => ({ ...current, rankMin: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-200">
            <span>Rank max</span>
            <input
              value={form.rankMax}
              onChange={(event) => setForm((current) => ({ ...current, rankMax: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/55 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="space-y-1 text-xs text-slate-200 lg:col-span-2">
            <span>Roles needed (comma separated)</span>
            <input
              value={form.rolesNeeded}
              onChange={(event) => setForm((current) => ({ ...current, rolesNeeded: event.target.value }))}
              className="w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="space-y-1 text-xs text-gray-300">
            <span>Tone</span>
            <input
              value={form.tone}
              onChange={(event) => setForm((current) => ({ ...current, tone: event.target.value }))}
              className="w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-sm text-white"
            />
          </label>

          <label className="space-y-1 text-xs text-gray-300">
            <span>Mic required</span>
            <select
              value={form.micRequired ? "yes" : "no"}
              onChange={(event) => setForm((current) => ({ ...current, micRequired: event.target.value === "yes" }))}
              className="w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-sm text-white"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={isCreating || !canCreate || !isAuthenticated}
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? "Publishing..." : "Publish LFG post"}
            </button>
          </div>
        </form>

        {message ? <p className="mt-3 text-sm text-emerald-100">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-100">{error}</p> : null}
      </article>

      {posts.map((post) => (
        <article key={post.id} className="border border-white/10 bg-slate-950/30 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">{post.title}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {post.game} • {post.region} • {post.rank}
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-medium text-emerald-100">
              {post.openSpots} open spots
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="border border-white/10 bg-slate-950/55 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                <Users className="h-4 w-4 text-cyan-200" />
                Roles needed
              </p>
              <div className="flex flex-wrap gap-2">
                {post.roles.map((role) => (
                  <span key={role} className="rounded-full border border-blue-400/40 bg-blue-900/40 px-3 py-1 text-xs text-blue-100">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="border border-gray-400/25 bg-gray-800/50 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                <TimerReset className="h-4 w-4 text-cyan-200" />
                Schedule and tone
              </p>
              <p className="text-sm leading-7 text-slate-300">{post.schedule}</p>
              <p className="text-sm text-slate-400">{post.tone}</p>
            </div>
            <div className="border border-white/10 bg-slate-950/55 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                <Mic className="h-4 w-4 text-cyan-200" />
                Comms expectation
              </p>
              <p className="text-sm leading-7 text-slate-300">
                {post.micRequired
                  ? "Microphone required for callouts and review"
                  : "Mic optional, but concise communication preferred"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => onApply(post.id)}
                disabled={Boolean(applyState[post.id])}
                className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {applyState[post.id] ? "Sending..." : "Request to join"}
              </button>
            ) : (
              <p className="text-sm text-slate-300">
                <Link href="/auth/sign-in" className="font-medium text-cyan-100 hover:text-cyan-50">
                  Sign in
                </Link>{" "}
                to request a spot.
              </p>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}