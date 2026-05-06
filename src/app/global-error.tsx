"use client";

import Link from "next/link";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[linear-gradient(180deg,#07111f_0%,#091425_45%,#050b14_100%)] p-6 text-slate-100">
        <main className="mx-auto mt-12 max-w-2xl rounded-[28px] border border-red-400/30 bg-red-400/10 p-8">
          <h1 className="text-3xl font-semibold text-white">Unexpected application error</h1>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            A critical error occurred. Retry the operation. If the problem continues, capture this digest and investigate server logs.
          </p>
          {error.digest ? (
            <p className="mt-3 text-xs text-slate-300">Error digest: {error.digest}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Retry
            </button>
            <Link
              href="/"
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
