"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

type ProfileSettings = {
  displayName: string;
  bio: string | null;
  region: string;
  timezone: string;
  language: string | null;
  micPreference: string;
  schedule: string | null;
};

type SettingsClientProps = {
  username: string;
  email: string;
  initialProfile: ProfileSettings;
};

export function SettingsClient({ username, email, initialProfile }: SettingsClientProps) {
  const [form, setForm] = useState({
    displayName: initialProfile.displayName,
    bio: initialProfile.bio ?? "",
    region: initialProfile.region,
    timezone: initialProfile.timezone,
    language: initialProfile.language ?? "",
    micPreference: initialProfile.micPreference,
    schedule: initialProfile.schedule ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isOpeningBilling, setIsOpeningBilling] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  async function onSaveProfile() {
    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    const response = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setSaveError(payload?.error ?? "Could not save your settings.");
      setIsSaving(false);
      return;
    }

    setSaveMessage("Settings saved successfully.");
    setIsSaving(false);
  }

  async function onOpenBillingPortal() {
    setIsOpeningBilling(true);
    setBillingError(null);

    const response = await fetch("/api/billing/portal", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

    if (!response.ok || !payload?.url) {
      setBillingError(payload?.error ?? "Billing portal is not available yet.");
      setIsOpeningBilling(false);
      return;
    }

    window.location.assign(payload.url);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold text-white">Profile preferences</h2>
        <p className="mt-2 text-sm text-slate-300">These values update your account profile and are used for matchmaking relevance.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            <span>Display name</span>
            <input
              value={form.displayName}
              onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-white"
              maxLength={40}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Region</span>
            <input
              value={form.region}
              onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-white"
              maxLength={64}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Timezone</span>
            <input
              value={form.timezone}
              onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-white"
              maxLength={64}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Mic preference</span>
            <input
              value={form.micPreference}
              onChange={(event) => setForm((current) => ({ ...current, micPreference: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-white"
              maxLength={64}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200 sm:col-span-2">
            <span>Language</span>
            <input
              value={form.language}
              onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-white"
              maxLength={64}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200 sm:col-span-2">
            <span>Schedule</span>
            <input
              value={form.schedule}
              onChange={(event) => setForm((current) => ({ ...current, schedule: event.target.value }))}
              className="w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-white"
              maxLength={160}
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200 sm:col-span-2">
            <span>Bio</span>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              className="h-28 w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-white"
              maxLength={400}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSaveProfile}
            disabled={isSaving}
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>
          {saveMessage ? <p className="text-sm text-emerald-200">{saveMessage}</p> : null}
          {saveError ? <p className="text-sm text-rose-200">{saveError}</p> : null}
        </div>
      </section>

      <aside className="space-y-4">
        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Account</h3>
          <dl className="mt-4 space-y-2 text-sm text-slate-300">
            <div>
              <dt className="text-slate-400">Username</dt>
              <dd>{username}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Email</dt>
              <dd>{email || "No email available"}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Billing</h3>
          <p className="mt-2 text-sm text-slate-300">Manage your subscription via Stripe portal when billing is configured.</p>
          <button
            type="button"
            onClick={onOpenBillingPortal}
            disabled={isOpeningBilling}
            className="mt-4 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isOpeningBilling ? "Opening..." : "Open billing portal"}
          </button>
          {billingError ? <p className="mt-3 text-sm text-rose-200">{billingError}</p> : null}
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">Session</h3>
          <p className="mt-2 text-sm text-slate-300">Sign out of the current account on this device.</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-4 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Sign out
          </button>
        </article>
      </aside>
    </div>
  );
}
