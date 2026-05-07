"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { REGION_OPTIONS, TIMEZONE_OPTIONS } from "@/lib/profile-options";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    region: "NA Central",
    timezone: "America/Chicago",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const registerResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!registerResponse.ok) {
      const payload = (await registerResponse.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Registration failed.");
      setIsSubmitting(false);
      return;
    }

    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
      callbackUrl: "/settings",
    });

    if (!login || login.error) {
      setError("Account created, but automatic sign-in failed. Please sign in manually.");
      setIsSubmitting(false);
      return;
    }

    router.push("/settings");
    router.refresh();
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <label className="rb-text-body block space-y-2 text-sm">
        <span>Email</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="rb-field w-full rounded-xl px-3 py-2"
          autoComplete="email"
        />
      </label>

      <label className="rb-text-body block space-y-2 text-sm">
        <span>Username</span>
        <input
          type="text"
          required
          minLength={3}
          maxLength={24}
          value={form.username}
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          className="rb-field w-full rounded-xl px-3 py-2"
          autoComplete="username"
        />
      </label>

      <label className="rb-text-body block space-y-2 text-sm">
        <span>Password</span>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          className="rb-field w-full rounded-xl px-3 py-2"
          autoComplete="new-password"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="rb-text-body block space-y-2 text-sm">
          <span>Region</span>
          <select
            value={form.region}
            onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))}
            className="rb-field w-full rounded-xl px-3 py-2"
          >
            {REGION_OPTIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label className="rb-text-body block space-y-2 text-sm">
          <span>Timezone</span>
          <select
            value={form.timezone}
            onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
            className="rb-field w-full rounded-xl px-3 py-2"
          >
            {TIMEZONE_OPTIONS.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="text-sm text-rose-200">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rb-button-primary w-full rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="rb-text-body text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-medium text-blue-600 transition hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200">
          Sign in
        </Link>
      </p>
    </form>
  );
}
