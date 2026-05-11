"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (response.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/auth/sign-in"), 2000);
    } else {
      const payload = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(payload?.error?.message ?? "This reset link is invalid or has expired.");
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <p className="rb-badge-success inline-flex rounded-full px-3 py-1 text-xs font-medium">Password updated</p>
        <h1 className="rb-text-strong mt-4 text-3xl font-semibold">Password changed</h1>
        <p className="rb-text-body mt-2 text-sm">Your password has been updated. Redirecting to sign in…</p>
      </>
    );
  }

  if (!token) {
    return (
      <>
        <p className="rb-badge-error inline-flex rounded-full px-3 py-1 text-xs font-medium">Invalid link</p>
        <h1 className="rb-text-strong mt-4 text-3xl font-semibold">Link missing</h1>
        <p className="rb-text-body mt-2 text-sm">
          No reset token found. Please{" "}
          <Link href="/auth/forgot-password" className="font-medium text-blue-600 underline dark:text-blue-300">
            request a new reset link
          </Link>
          .
        </p>
      </>
    );
  }

  return (
    <>
      <p className="rb-badge-info inline-flex rounded-full px-3 py-1 text-xs font-medium">Set new password</p>
      <h1 className="rb-text-strong mt-4 text-3xl font-semibold">Reset your password</h1>
      <p className="rb-text-body mt-2 text-sm">Choose a strong password for your account.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="rb-text-body block space-y-2 text-sm">
          <span>New password</span>
          <input
            type="password"
            required
            minLength={8}
            maxLength={128}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rb-field w-full rounded-xl px-3 py-2"
            autoComplete="new-password"
          />
        </label>

        <label className="rb-text-body block space-y-2 text-sm">
          <span>Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            maxLength={128}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            className="rb-field w-full rounded-xl px-3 py-2"
            autoComplete="new-password"
          />
        </label>

        {error ? <p className="text-sm text-rose-200">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rb-button-primary w-full rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Updating password..." : "Set new password"}
        </button>

        <p className="rb-text-body text-center text-sm">
          <Link href="/auth/forgot-password" className="font-medium text-blue-600 transition hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200">
            Request a new link
          </Link>
        </p>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="rb-auth-page px-4 py-10">
      <div className="rb-auth-card mx-auto max-w-md rounded-[28px] p-6">
        <Suspense fallback={<p className="rb-text-body text-sm">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
