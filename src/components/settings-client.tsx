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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "day";
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "night" || stored === "day" ? stored : "day";
  });

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
      <section className="rb-surface-strong rounded-[28px] p-6">
        <h2 className="rb-text-strong text-2xl font-semibold">Profile preferences</h2>
        <p className="rb-text-body mt-2 text-sm">These values update your account profile and are used for matchmaking relevance.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="rb-text-body space-y-2 text-sm">
            <span>Display name</span>
            <input
              value={form.displayName}
              onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
              className="rb-field w-full rounded-xl px-3 py-2"
              maxLength={40}
            />
          </label>

          <label className="rb-text-body space-y-2 text-sm">
            <span>Region</span>
            <input
              value={form.region}
              onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}
              className="rb-field w-full rounded-xl px-3 py-2"
              maxLength={64}
            />
          </label>

          <label className="rb-text-body space-y-2 text-sm">
            <span>Timezone</span>
            <input
              value={form.timezone}
              onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
              className="rb-field w-full rounded-xl px-3 py-2"
              maxLength={64}
            />
          </label>

          <label className="rb-text-body space-y-2 text-sm">
            <span>Mic preference</span>
            <input
              value={form.micPreference}
              onChange={(event) => setForm((current) => ({ ...current, micPreference: event.target.value }))}
              className="rb-field w-full rounded-xl px-3 py-2"
              maxLength={64}
            />
          </label>

          <label className="rb-text-body space-y-2 text-sm sm:col-span-2">
            <span>Language</span>
            <input
              value={form.language}
              onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))}
              className="rb-field w-full rounded-xl px-3 py-2"
              maxLength={64}
            />
          </label>

          <label className="rb-text-body space-y-2 text-sm sm:col-span-2">
            <span>Schedule</span>
            <input
              value={form.schedule}
              onChange={(event) => setForm((current) => ({ ...current, schedule: event.target.value }))}
              className="rb-field w-full rounded-xl px-3 py-2"
              maxLength={160}
            />
          </label>

          <label className="rb-text-body space-y-2 text-sm sm:col-span-2">
            <span>Bio</span>
            <textarea
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              className="rb-field h-28 w-full rounded-xl px-3 py-2"
              maxLength={400}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSaveProfile}
            disabled={isSaving || !hasUnsavedChanges}
            className="rb-button-primary rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Save settings"}
          </button>
          <button
            type="button"
            onClick={onResetUnsavedChanges}
            disabled={isSaving || !hasUnsavedChanges}
            className="rb-button-subtle rounded-full px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            Reset unsaved
          </button>
          <button
            type="button"
            onClick={onUndoLastSave}
            disabled={isSaving || !previousSavedForm}
            className="rb-badge-success rounded-full px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            Undo last save
          </button>
          {saveMessage ? <p className="text-sm text-emerald-200">{saveMessage}</p> : null}
          {saveError ? <p className="text-sm text-rose-200">{saveError}</p> : null}
        </div>
      </section>

      <aside className="space-y-4">
        <article className="rb-surface-strong rounded-[28px] p-6">
          <h3 className="rb-text-strong text-xl font-semibold">Appearance</h3>
          <p className="rb-text-body mt-2 text-sm">Choose how Raidbase looks on this device.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setThemeMode("day")}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                themeMode === "day"
                  ? "rb-badge-info"
                  : "rb-button-secondary"
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
                  ? "rb-badge-info"
                  : "rb-button-secondary"
              }`}
              aria-pressed={themeMode === "night"}
            >
              Night
            </button>
          </div>
        </article>

        <article className="rb-surface-strong rounded-[28px] p-6">
          <h3 className="rb-text-strong text-xl font-semibold">Account</h3>
          <dl className="rb-text-body mt-4 space-y-2 text-sm">
            <div>
              <dt className="rb-text-muted">Username</dt>
              <dd>{username}</dd>
            </div>
            <div>
              <dt className="rb-text-muted">Email</dt>
              <dd>{email || "No email available"}</dd>
            </div>
            <div>
              <dt className="rb-text-muted">Last synced</dt>
              <dd>{new Date(syncedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </article>

        <article className="rb-surface-strong rounded-[28px] p-6">
          <h3 className="rb-text-strong text-xl font-semibold">Billing</h3>
          <p className="rb-text-body mt-2 text-sm">Manage your subscription via Stripe portal when billing is configured.</p>
          <button
            type="button"
            onClick={onOpenBillingPortal}
            disabled={isOpeningBilling}
            className="rb-button-subtle mt-4 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isOpeningBilling ? "Opening..." : "Open billing portal"}
          </button>
          {billingError ? <p className="mt-3 text-sm text-rose-200">{billingError}</p> : null}
        </article>

        <article className="rb-surface-strong rounded-[28px] p-6">
          <h3 className="rb-text-strong text-xl font-semibold">Session</h3>
          <p className="rb-text-body mt-2 text-sm">Sign out of the current account on this device.</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rb-button-subtle mt-4 rounded-full px-4 py-2 text-sm font-medium transition"
          >
            Sign out
          </button>
        </article>

        <article className="rb-surface-strong rounded-[28px] p-6">
          <h3 className="rb-text-strong text-xl font-semibold">Help and trust</h3>
          <p className="rb-text-body mt-2 text-sm">
            Need support or want full transparency on trust scoring? Start with these docs.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href="/privacy" className="rb-button-secondary rounded-full px-3 py-1.5 text-xs transition">
              Privacy policy
            </a>
            <a href="/terms" className="rb-button-secondary rounded-full px-3 py-1.5 text-xs transition">
              Terms
            </a>
          </div>
        </article>
      </aside>
    </div>
  );
}
