"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Always show success to prevent enumeration
    setSubmitted(true);
    setIsSubmitting(false);
  }

  return (
    <main className="rb-auth-page px-4 py-10">
      <div className="rb-auth-card mx-auto max-w-md rounded-[28px] p-6">
        {submitted ? (
          <>
            <p className="rb-badge-success inline-flex rounded-full px-3 py-1 text-xs font-medium">Check your inbox</p>
            <h1 className="rb-text-strong mt-4 text-3xl font-semibold">Reset link sent</h1>
            <p className="rb-text-body mt-2 text-sm">
              If that email is associated with a RaidBase account, we&apos;ve sent a password reset link. Check your inbox and spam folder.
            </p>
            <p className="rb-text-body mt-4 text-sm">
              <Link href="/auth/sign-in" className="font-medium text-blue-600 underline dark:text-blue-300">
                Return to sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <p className="rb-badge-info inline-flex rounded-full px-3 py-1 text-xs font-medium">Password reset</p>
            <h1 className="rb-text-strong mt-4 text-3xl font-semibold">Forgot your password?</h1>
            <p className="rb-text-body mt-2 text-sm">Enter your email and we&apos;ll send you a reset link if an account exists.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <label className="rb-text-body block space-y-2 text-sm">
                <span>Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="rb-field w-full rounded-xl px-3 py-2"
                  autoComplete="email"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rb-button-primary w-full rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>

              <p className="rb-text-body text-center text-sm">
                <Link href="/auth/sign-in" className="font-medium text-blue-600 transition hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200">
                  Back to sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
