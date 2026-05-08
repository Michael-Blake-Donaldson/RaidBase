"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SourceMode = "link" | "upload";

export function ClipsUploader() {
  const router = useRouter();
  const [mode, setMode] = useState<SourceMode>("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [gameSlug, setGameSlug] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response =
        mode === "upload"
          ? await submitFileUpload({ title, gameSlug, visibility, file })
          : await submitLink({ title, url, gameSlug, visibility });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Could not save clip.");
        return;
      }

      setMessage("Clip saved. Your showcase has been refreshed.");
      setTitle("");
      setUrl("");
      setGameSlug("");
      setFile(null);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rb-surface-strong rounded-[28px] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="rb-text-strong text-xl font-semibold">Add a new clip</h2>
          <p className="rb-text-body mt-1 text-sm">Upload local highlights or attach a stream/video link.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              mode === "link" ? "rb-badge-info" : "rb-button-secondary"
            }`}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              mode === "upload" ? "rb-badge-info" : "rb-button-secondary"
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="rb-text-body space-y-1 text-sm sm:col-span-2">
          <span>Clip title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rb-field w-full rounded-xl px-3 py-2"
            maxLength={120}
            required
          />
        </label>

        {mode === "link" ? (
          <label className="rb-text-body space-y-1 text-sm sm:col-span-2">
            <span>Clip URL</span>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="rb-field w-full rounded-xl px-3 py-2"
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </label>
        ) : (
          <label className="rb-text-body space-y-1 text-sm sm:col-span-2">
            <span>Video file (mp4, webm, mov, max 50MB)</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="rb-field w-full rounded-xl px-3 py-2"
              required
            />
          </label>
        )}

        <label className="rb-text-body space-y-1 text-sm">
          <span>Game slug (optional)</span>
          <input
            value={gameSlug}
            onChange={(event) => setGameSlug(event.target.value)}
            className="rb-field w-full rounded-xl px-3 py-2"
            placeholder="valorant"
          />
        </label>

        <label className="rb-text-body space-y-1 text-sm">
          <span>Visibility</span>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value === "private" ? "private" : "public")}
            className="rb-field w-full rounded-xl px-3 py-2"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rb-button-primary rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : mode === "upload" ? "Upload clip" : "Save clip link"}
        </button>
        {message ? <p className="text-sm text-emerald-200">{message}</p> : null}
        {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      </div>
    </form>
  );
}

async function submitLink(input: {
  title: string;
  url: string;
  gameSlug: string;
  visibility: "public" | "private";
}) {
  return fetch("/api/clips", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      title: input.title,
      url: input.url,
      gameSlug: input.gameSlug || undefined,
      visibility: input.visibility,
    }),
  });
}

async function submitFileUpload(input: {
  title: string;
  gameSlug: string;
  visibility: "public" | "private";
  file: File | null;
}) {
  const form = new FormData();
  form.set("title", input.title);
  form.set("visibility", input.visibility);

  if (input.gameSlug) {
    form.set("gameSlug", input.gameSlug);
  }

  if (input.file) {
    form.set("file", input.file);
  }

  return fetch("/api/clips", {
    method: "POST",
    body: form,
  });
}
