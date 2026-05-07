"use client";

import { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";

const THEME_STORAGE_KEY = "raidbase-theme";

type ThemeMode = "day" | "night";

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
  lastSyncedAt: string;
};

export function SettingsClient({ username, email, initialProfile, lastSyncedAt }: SettingsClientProps) {
  const initialForm = {
    displayName: initialProfile.displayName,
    bio: initialProfile.bio ?? "",
    region: initialProfile.region,
    timezone: initialProfile.timezone,
    language: initialProfile.language ?? "",
    micPreference: initialProfile.micPreference,
    schedule: initialProfile.schedule ?? "",
  };

  const [form, setForm] = useState({
    ...initialForm,
  });
  const [baselineForm, setBaselineForm] = useState({ ...initialForm });
  const [previousSavedForm, setPreviousSavedForm] = useState<typeof initialForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState(lastSyncedAt);
  const [isOpeningBilling, setIsOpeningBilling] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("day");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === "night" || stored === "day") {
      setThemeMode(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.rbTheme = themeMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(baselineForm),
    [form, baselineForm],
  );

  async function saveProfile(nextForm: typeof initialForm, options?: { successMessage?: string }) {
    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    const response = await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(nextForm),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          profile?: {
            displayName: string;
            bio: string | null;
            region: string;
            timezone: string;
            language: string | null;
            micPreference: string;
            schedule: string | null;
            updatedAt: string;
          };
        }
      | null;

    if (!response.ok) {
      setSaveError(payload?.error ?? "Could not save your settings.");
      setIsSaving(false);
      return;
    }

    if (payload?.profile) {
      const normalized = {
        displayName: payload.profile.displayName,
        bio: payload.profile.bio ?? "",
        region: payload.profile.region,
        timezone: payload.profile.timezone,
        language: payload.profile.language ?? "",
        micPreference: payload.profile.micPreference,
        schedule: payload.profile.schedule ?? "",
      };
      setForm(normalized);
      setBaselineForm(normalized);
      setSyncedAt(payload.profile.updatedAt);
    }

    setSaveMessage(options?.successMessage ?? "Settings saved successfully.");
    setIsSaving(false);
  }

  async function onSaveProfile() {
    setPreviousSavedForm({ ...baselineForm });
    await saveProfile(form);
  }

  async function onUndoLastSave() {
    if (!previousSavedForm) {
      return;
    }

    await saveProfile(previousSavedForm, {
      successMessage: "Last save reverted. Previous settings restored.",
    });
    setPreviousSavedForm(null);
  }

  function onResetUnsavedChanges() {
    setForm({ ...baselineForm });
    setSaveError(null);
    setSaveMessage("Unsaved edits were reset.");
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
      <section className="rounded-[28px] border border-gray-400/30 bg-gray-900/60 p-6">
        <h2 className="text-2xl font-semibold text-white">Profile preferences</h2>
        <p className="mt-2 text-sm text-gray-300">These values update your account profile and are used for matchmaking relevance.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-gray-200">
            <span>Display name</span>
            <input
              value={form.displayName}
              onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
              className="w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-white"
              maxLength={40}
            />
          </label>

          <label className="space-y-2 text-sm text-gray-200">
            <span>Region</span>
            <input
              value={form.region}
              onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}
              className="w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-white"
              maxLength={64}
            />
          </label>

          <label className="space-y-2 text-sm text-gray-200">
            <span>Timezone</span>
            <input
              value={form.timezone}
              onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
              className="w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-white"
              maxLength={64}
            />
          </label>

          <label className="space-y-2 text-sm text-gray-200">
            <span>Mic preference</span>
            <input
              value={form.micPreference}
              onChange={(event) => setForm((current) => ({ ...current, micPreference: event.target.value }))}
              className="w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-white"
              maxLength={64}
            />
          </label>

          <label className="space-y-2 text-sm text-gray-200 sm:col-span-2">
            <span>Language</span>
            <input
              value={form.language}
              onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
              className="w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-white"
              maxLength={64}
            />
          </label>

          <label className="space-y-2 text-sm text-gray-200 sm:col-span-2">
            <span>Schedule</span>
            <input
              value={form.schedule}
              onChange={(event) => setForm((current) => ({ ...current, schedule: event.target.value }))}
              className="w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-white"
              maxLength={160}
            />
          </label>

          <label className="space-y-2 text-sm text-gray-200 sm:col-span-2">
            <span>Bio</span>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              className="h-28 w-full rounded-xl border border-gray-400/30 bg-gray-800/50 px-3 py-2 text-white"
              maxLength={400}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSaveProfile}
            disabled={isSaving || !hasUnsavedChanges}
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>
          <button
            type="button"
            onClick={onResetUnsavedChanges}
            disabled={isSaving || !hasUnsavedChanges}
            className="rounded-full border border-blue-400/40 bg-blue-900/30 px-4 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-blue-900/50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Reset unsaved
          </button>
          <button
            type="button"
            onClick={onUndoLastSave}
            disabled={isSaving || !previousSavedForm}
            className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Undo last save
          </button>
          {saveMessage ? <p className="text-sm text-emerald-200">{saveMessage}</p> : null}
          {saveError ? <p className="text-sm text-rose-200">{saveError}</p> : null}
        </div>
      </section>

      <aside className="space-y-4">
        <article className="rounded-[28px] border border-gray-400/30 bg-gray-900/60 p-6">
          <h3 className="text-xl font-semibold text-white">Appearance</h3>
          <p className="mt-2 text-sm text-gray-300">Choose how Raidbase looks on this device.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setThemeMode("day")}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                themeMode === "day"
                  ? "border-blue-300 bg-blue-100 text-blue-900"
                  : "border-gray-400/30 bg-gray-800/50 text-gray-200 hover:bg-gray-800/70"
              }`}
              aria-pressed={themeMode === "day"}
            >
              Day
            </button>
            <button
              type="button"
              onClick={() => setThemeMode("night")}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                themeMode === "night"
                  ? "border-blue-300 bg-blue-100 text-blue-900"
                  : "border-gray-400/30 bg-gray-800/50 text-gray-200 hover:bg-gray-800/70"
              }`}
              aria-pressed={themeMode === "night"}
            >
              Night
            </button>
          </div>
        </article>

        <article className="rounded-[28px] border border-gray-400/30 bg-gray-900/60 p-6">
          <h3 className="text-xl font-semibold text-white">Account</h3>
          <dl className="mt-4 space-y-2 text-sm text-gray-300">
            <div>
              <dt className="text-gray-400">Username</dt>
              <dd>{username}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Email</dt>
              <dd>{email || "No email available"}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Last synced</dt>
              <dd>{new Date(syncedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-[28px] border border-gray-400/30 bg-gray-900/60 p-6">
          <h3 className="text-xl font-semibold text-white">Billing</h3>
          <p className="mt-2 text-sm text-gray-300">Manage your subscription via Stripe portal when billing is configured.</p>
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

        <article className="rounded-[28px] border border-gray-400/30 bg-gray-900/60 p-6">
          <h3 className="text-xl font-semibold text-white">Session</h3>
          <p className="mt-2 text-sm text-gray-300">Sign out of the current account on this device.</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-4 rounded-full border border-blue-400/40 bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-900/50"
          >
            Sign out
          </button>
        </article>

        <article className="rounded-[28px] border border-gray-400/30 bg-gray-900/60 p-6">
          <h3 className="text-xl font-semibold text-white">Help and trust</h3>
          <p className="mt-2 text-sm text-gray-300">
            Need support or want full transparency on trust scoring? Start with these docs.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/privacy" className="rounded-full border border-gray-400/30 bg-gray-800/40 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-gray-800/60">
              Privacy policy
            </a>
            <a href="/terms" className="rounded-full border border-gray-400/30 bg-gray-800/40 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-gray-800/60">
              Terms
            </a>
          </div>
        </article>
      </aside>
    </div>
  );
}
