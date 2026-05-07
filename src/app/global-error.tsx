"use client";

import Link from "next/link";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="rb-auth-page p-6">
        <main className="mx-auto mt-12 max-w-2xl rounded-[28px] border border-red-400/35 bg-red-50/95 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <h1 className="rb-text-strong text-3xl font-semibold">Unexpected application error</h1>
          <p className="rb-text-body mt-4 text-sm leading-7">
            A critical error occurred. Retry the operation. If the problem continues, capture this digest and investigate server logs.
          </p>
          {error.digest ? (
            <p className="rb-text-muted mt-3 text-xs">Error digest: {error.digest}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="rb-button-primary rounded-full px-5 py-2.5 text-sm font-semibold transition"
            >
              Retry
            </button>
            <Link
              href="/"
              className="rb-button-secondary rounded-full px-5 py-2.5 text-sm font-medium transition"
            >
              Return home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
