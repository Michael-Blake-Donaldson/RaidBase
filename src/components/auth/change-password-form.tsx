"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function onChange(field: keyof typeof form) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/settings/security", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    });

    if (response.ok) {
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(payload?.error?.message ?? "Password change failed. Please try again.");
    }

    setIsSubmitting(false);
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <label className="rb-text-body block space-y-2 text-sm">
        <span>Current password</span>
        <input
          type="password"
          required
          value={form.currentPassword}
          onChange={onChange("currentPassword")}
          className="rb-field w-full rounded-xl px-3 py-2"
          autoComplete="current-password"
        />
      </label>

      <label className="rb-text-body block space-y-2 text-sm">
        <span>New password</span>
        <input
          type="password"
          required
          minLength={8}
          maxLength={128}
          value={form.newPassword}
          onChange={onChange("newPassword")}
          className="rb-field w-full rounded-xl px-3 py-2"
          autoComplete="new-password"
        />
      </label>

      <label className="rb-text-body block space-y-2 text-sm">
        <span>Confirm new password</span>
        <input
          type="password"
          required
          minLength={8}
          maxLength={128}
          value={form.confirmPassword}
          onChange={onChange("confirmPassword")}
          className="rb-field w-full rounded-xl px-3 py-2"
          autoComplete="new-password"
        />
      </label>

      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
      {success ? <p className="text-sm text-green-300">Password updated successfully.</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rb-button-primary rounded-full px-6 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
