"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/settings",
    });

    if (!response || response.error) {
      setError("Invalid email or password.");
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rb-field w-full rounded-xl px-3 py-2"
          autoComplete="email"
        />
      </label>

      <label className="rb-text-body block space-y-2 text-sm">
        <span>Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rb-field w-full rounded-xl px-3 py-2"
          autoComplete="current-password"
        />
      </label>

      {error ? <p className="text-sm text-rose-200">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rb-button-primary w-full rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="rb-text-body text-center text-sm">
        Need an account?{" "}
        <Link href="/auth/register" className="font-medium text-blue-600 transition hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200">
          Register
        </Link>
      </p>
    </form>
  );
}
