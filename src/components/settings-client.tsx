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
  preferredPlayType: string | null;
  playstyleTraits: string[] | null;
};

type SettingsClientProps = {
  username: string;
  email: string;
  initialProfile: ProfileSettings;
  lastSyncedAt: string;
};

type BillingSnapshot = {
  plan: "FREE" | "PRO";
  status: "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  currentPeriodEnd?: string;
  clipLimit?: number;
};

function isBillingSnapshot(value: unknown): value is BillingSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as { plan?: unknown; status?: unknown; clipLimit?: unknown };

  const validPlan = candidate.plan === "FREE" || candidate.plan === "PRO";
  const validStatus =
    candidate.status === "INACTIVE" ||
    candidate.status === "ACTIVE" ||
    candidate.status === "PAST_DUE" ||
    candidate.status === "CANCELED";
  const validClipLimit =
    typeof candidate.clipLimit === "undefined" || typeof candidate.clipLimit === "number";

  return validPlan && validStatus && validClipLimit;
}

const PLAYSTYLE_ARCHETYPES = ["Shotcaller", "Strategist", "Support Anchor", "Aggressive Fragger"] as const;

const PLAYSTYLE_TRAIT_MAP: Record<(typeof PLAYSTYLE_ARCHETYPES)[number], string[]> = {
  Shotcaller: ["Decisive comms", "Momentum control", "Team direction"],
  Strategist: ["Map awareness", "Prep and adaptation", "Objective focus"],
  "Support Anchor": ["Team-first mindset", "Utility discipline", "Consistency"],
  "Aggressive Fragger": ["High tempo", "Entry confidence", "Mechanical pressure"],
};

const PLAYSTYLE_QUESTIONS = [
  {
    prompt: "When your team falls behind early, what is your instinct?",
    options: [
      "Take control of comms and reset the plan.",
      "Study enemy patterns and adjust the approach.",
      "Stabilize teammates and protect morale.",
      "Force an aggressive play to regain momentum.",
    ],
  },
  {
    prompt: "Which role in a close match feels most natural?",
    options: [
      "Primary voice and pace setter.",
      "Tactical planner and adaptation lead.",
      "Reliable backbone who enables everyone.",
      "Playmaker who cracks rounds open.",
    ],
  },
  {
    prompt: "How do you prepare for a session?",
    options: [
      "Define team priorities and callout standards.",
      "Review map, comp, and win-condition notes.",
      "Check support tools, loadouts, and team needs.",
      "Warm mechanics and look for entry timings.",
    ],
  },
  {
    prompt: "What do teammates usually praise you for?",
    options: [
      "Confident leadership under pressure.",
      "Smart reads and strategic choices.",
      "Reliable support and calm coordination.",
      "Clutch plays and proactive pressure.",
    ],
  },
] as const;

function derivePlaystyleFromAnswers(answers: number[]) {
  const counts = new Map<(typeof PLAYSTYLE_ARCHETYPES)[number], number>(
    PLAYSTYLE_ARCHETYPES.map((type) => [type, 0]),
  );

  for (const answer of answers) {
    const pickedType = PLAYSTYLE_ARCHETYPES[answer] ?? PLAYSTYLE_ARCHETYPES[0];
    counts.set(pickedType, (counts.get(pickedType) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const preferredPlayType = ranked[0]?.[0] ?? PLAYSTYLE_ARCHETYPES[0];
  const playstyleTraits = PLAYSTYLE_TRAIT_MAP[preferredPlayType];

  return { preferredPlayType, playstyleTraits };
}

export function SettingsClient({ username, email, initialProfile, lastSyncedAt }: SettingsClientProps) {
  const initialForm = {
    displayName: initialProfile.displayName,
    bio: initialProfile.bio ?? "",
    region: initialProfile.region,
    timezone: initialProfile.timezone,
    language: initialProfile.language ?? "",
    micPreference: initialProfile.micPreference,
    schedule: initialProfile.schedule ?? "",
    preferredPlayType: initialProfile.preferredPlayType ?? "Balanced",
    playstyleTraits: initialProfile.playstyleTraits ?? [],
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
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingSnapshot, setBillingSnapshot] = useState<BillingSnapshot | null>(null);
  const [isExportingAccount, setIsExportingAccount] = useState(false);
  const [accountExportError, setAccountExportError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [accountDeleteError, setAccountDeleteError] = useState<string | null>(null);
  const [deleteUsername, setDeleteUsername] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Array<number | null>>(
    Array.from({ length: PLAYSTYLE_QUESTIONS.length }, () => null),
  );
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

  useEffect(() => {
    async function loadBilling() {
      const response = await fetch("/api/billing/entitlements", { method: "GET", cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !isBillingSnapshot(payload)) {
        return;
      }

      setBillingSnapshot(payload);
    }

    void loadBilling();
  }, []);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(baselineForm),
    [form, baselineForm],
  );

  const isQuizComplete = quizAnswers.every((answer) => answer !== null);

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
            preferredPlayType: string | null;
            playstyleTraits: string[] | null;
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
      const normalizedTraits = Array.isArray(payload.profile.playstyleTraits)
        ? payload.profile.playstyleTraits.filter((trait): trait is string => typeof trait === "string")
        : [];

      const normalized = {
        displayName: payload.profile.displayName,
        bio: payload.profile.bio ?? "",
        region: payload.profile.region,
        timezone: payload.profile.timezone,
        language: payload.profile.language ?? "",
        micPreference: payload.profile.micPreference,
        schedule: payload.profile.schedule ?? "",
        preferredPlayType: payload.profile.preferredPlayType ?? "Balanced",
        playstyleTraits: normalizedTraits,
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

  function onApplyPlaystyleQuiz() {
    if (!isQuizComplete) {
      return;
    }

    const answered = quizAnswers.map((answer) => answer ?? 0);
    const result = derivePlaystyleFromAnswers(answered);

    setForm((current) => ({
      ...current,
      preferredPlayType: result.preferredPlayType,
      playstyleTraits: result.playstyleTraits,
    }));
    setSaveError(null);
    setSaveMessage("Playstyle quiz result applied. Save settings to persist.");
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

  async function onStartCheckout() {
    setIsStartingCheckout(true);
    setBillingError(null);

    const response = await fetch("/api/billing/checkout", { method: "POST" });
    const payload = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

    if (!response.ok || !payload?.url) {
      setBillingError(payload?.error ?? "Could not start checkout.");
      setIsStartingCheckout(false);
      return;
    }

    window.location.assign(payload.url);
  }

  async function onExportAccountData() {
    setIsExportingAccount(true);
    setAccountExportError(null);

    const response = await fetch("/api/settings/export", {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string | { message?: string } }
        | null;

      const errorMessage =
        typeof payload?.error === "string"
          ? payload.error
          : payload?.error?.message ?? "Could not export account data.";

      setAccountExportError(errorMessage);
      setIsExportingAccount(false);
      return;
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const filenameFromHeader = response.headers
      .get("content-disposition")
      ?.match(/filename=\"([^\"]+)\"/)?.[1];

    const downloadName = filenameFromHeader ?? `raidbase-export-${username}.json`;
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);

    setIsExportingAccount(false);
  }

  async function onDeleteAccount() {
    setIsDeletingAccount(true);
    setAccountDeleteError(null);

    const response = await fetch("/api/settings/account", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: deleteUsername,
        confirmationText: deleteConfirmationText,
        password: deletePassword,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setAccountDeleteError(payload?.error ?? "Could not delete account.");
      setIsDeletingAccount(false);
      return;
    }

    await signOut({ callbackUrl: "/?account=deleted" });
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

          <div className="rb-surface-soft space-y-4 rounded-2xl p-4 sm:col-span-2">
            <div>
              <p className="rb-text-strong text-sm font-semibold">Play style profile</p>
              <p className="rb-text-body mt-1 text-xs">
                Take this quick personality/characteristics test to improve teammate matching quality.
              </p>
            </div>

            <div className="space-y-4">
              {PLAYSTYLE_QUESTIONS.map((question, questionIndex) => (
                <fieldset key={question.prompt} className="space-y-2">
                  <legend className="rb-text-strong text-xs font-medium">{question.prompt}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={option}
                        className="rb-text-body flex cursor-pointer items-start gap-2 rounded-xl border border-slate-300/60 px-3 py-2 text-xs"
                      >
                        <input
                          type="radio"
                          name={`playstyle-question-${questionIndex}`}
                          checked={quizAnswers[questionIndex] === optionIndex}
                          onChange={() =>
                            setQuizAnswers((current) => {
                              const next = [...current];
                              next[questionIndex] = optionIndex;
                              return next;
                            })
                          }
                          className="mt-0.5"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onApplyPlaystyleQuiz}
                disabled={!isQuizComplete}
                className="rb-button-subtle rounded-full px-4 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                Apply quiz result
              </button>
              <button
                type="button"
                onClick={() => setQuizAnswers(Array.from({ length: PLAYSTYLE_QUESTIONS.length }, () => null))}
                className="rb-button-secondary rounded-full px-4 py-2 text-xs font-medium transition"
              >
                Clear answers
              </button>
            </div>

            <div className="rb-pill rounded-xl px-3 py-2 text-xs">
              <p className="rb-text-strong font-medium">Current play type: {form.preferredPlayType || "Balanced"}</p>
              <p className="rb-text-body mt-1">
                Traits: {form.playstyleTraits.length > 0 ? form.playstyleTraits.join(" • ") : "Set by taking the quiz"}
              </p>
            </div>
          </div>
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

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={onExportAccountData}
              disabled={isExportingAccount}
              className="rb-button-subtle rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isExportingAccount ? "Exporting..." : "Export account data"}
            </button>

            <div className="rb-surface-soft space-y-2 rounded-2xl p-4">
              <p className="rb-text-strong text-xs font-semibold uppercase tracking-[0.2em]">Danger zone</p>
              <p className="rb-text-body text-xs">
                Deleting your account is permanent and removes profile, squads, reviews, clips, and connected records.
              </p>
              <label className="rb-text-body block text-xs">
                Confirm username
                <input
                  value={deleteUsername}
                  onChange={(event) => setDeleteUsername(event.target.value)}
                  className="rb-field mt-1 w-full rounded-xl px-3 py-2 text-sm"
                  placeholder={username}
                />
              </label>
              <label className="rb-text-body block text-xs">
                Type DELETE to confirm
                <input
                  value={deleteConfirmationText}
                  onChange={(event) => setDeleteConfirmationText(event.target.value)}
                  className="rb-field mt-1 w-full rounded-xl px-3 py-2 text-sm"
                  placeholder="DELETE"
                />
              </label>
              <label className="rb-text-body block text-xs">
                Current password
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  className="rb-field mt-1 w-full rounded-xl px-3 py-2 text-sm"
                  placeholder="Enter password"
                />
              </label>
              <button
                type="button"
                onClick={onDeleteAccount}
                disabled={isDeletingAccount}
                className="rb-badge-danger rounded-full px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeletingAccount ? "Deleting..." : "Delete my account"}
              </button>
            </div>

            {accountExportError ? <p className="text-sm text-rose-200">{accountExportError}</p> : null}
            {accountDeleteError ? <p className="text-sm text-rose-200">{accountDeleteError}</p> : null}
          </div>
        </article>

        <article className="rb-surface-strong rounded-[28px] p-6">
          <h3 className="rb-text-strong text-xl font-semibold">Billing</h3>
          <p className="rb-text-body mt-2 text-sm">Manage your subscription and unlock Pro entitlements.</p>

          <dl className="rb-text-body mt-4 space-y-2 text-sm">
            <div>
              <dt className="rb-text-muted">Plan</dt>
              <dd>{billingSnapshot?.plan ?? "FREE"}</dd>
            </div>
            <div>
              <dt className="rb-text-muted">Status</dt>
              <dd>{billingSnapshot?.status ?? "INACTIVE"}</dd>
            </div>
            <div>
              <dt className="rb-text-muted">Clip slots</dt>
              <dd>{billingSnapshot?.clipLimit ?? 3}</dd>
            </div>
            {billingSnapshot?.currentPeriodEnd ? (
              <div>
                <dt className="rb-text-muted">Current period ends</dt>
                <dd>{new Date(billingSnapshot.currentPeriodEnd).toLocaleString()}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStartCheckout}
              disabled={isStartingCheckout}
              className="rb-button-primary rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isStartingCheckout ? "Opening checkout..." : "Upgrade to Pro"}
            </button>
            <button
              type="button"
              onClick={onOpenBillingPortal}
              disabled={isOpeningBilling}
              className="rb-button-subtle rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isOpeningBilling ? "Opening..." : "Open billing portal"}
            </button>
          </div>
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
