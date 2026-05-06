"use client";

type LfgErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LfgError({ reset }: LfgErrorProps) {
  return (
    <div className="rounded-[28px] border border-red-400/30 bg-red-400/10 p-6 text-slate-100">
      <h2 className="text-2xl font-semibold text-white">LFG feed unavailable</h2>
      <p className="mt-3 text-sm leading-7 text-slate-200">
        We could not load live LFG posts. Try refreshing to pull the latest data.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
      >
        Retry LFG
      </button>
    </div>
  );
}
