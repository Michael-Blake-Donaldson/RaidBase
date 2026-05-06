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
      <label className="block space-y-2 text-sm text-slate-200">
        <span>Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-white"
          autoComplete="email"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-200">
        <span>Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-white/15 bg-slate-950/50 px-3 py-2 text-white"
          autoComplete="current-password"
        />
      </label>

      {error ? <p className="text-sm text-rose-200">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-slate-300">
        Need an account?{" "}
        <Link href="/auth/register" className="font-medium text-cyan-100 transition hover:text-cyan-50">
          Register
        </Link>
      </p>
    </form>
  );
}
