"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const guideSteps = [
  {
    title: "Understand the fit layer",
    body: "Profiles highlight rank, role, region, mic style, and reliability so you can judge squad fit fast.",
  },
  {
    title: "Browse live opportunities",
    body: "The LFG board filters by tone, schedule, and trust signals instead of noisy open queue guessing.",
  },
  {
    title: "Keep chemistry across sessions",
    body: "Squads and clips help good teams stay together and build memory instead of restarting every night.",
  },
];

type WelcomeGuidePopupProps = {
  shouldShow: boolean;
};

export function WelcomeGuidePopup({ shouldShow }: WelcomeGuidePopupProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(shouldShow);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function dismiss() {
    setOpen(false);
  }

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Dismiss welcome guide"
        onClick={dismiss}
        className="absolute inset-0 bg-slate-950/72 backdrop-blur-md transition"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-guide-title"
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(11,15,20,0.96),rgba(15,23,42,0.96),rgba(3,7,18,0.98))] text-white shadow-[0_30px_120px_rgba(2,6,23,0.65)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_28%)]" />

        <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  First visit guide
                </span>
                <h2 id="welcome-guide-title" className="max-w-xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Meet Raidbase before you decide to join it.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  This popup gives a fast tour of the product so new visitors understand how profiles, LFG, squads, and trust signals fit together. You can sign up at the end, or close this guide and explore freely.
                </p>
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                aria-label="Close welcome guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {guideSteps.map((step, index) => (
                <article key={step.title} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-sm font-semibold text-cyan-100">
                      0{index + 1}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{step.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-950/40 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-cyan-200" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-white">Trust first, not noise first</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Reputation, moderation, and session history are meant to make better teammate decisions feel obvious.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-slate-950/40 p-4">
                <Users className="mt-0.5 h-5 w-5 text-emerald-200" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-white">Explore without pressure</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    You can browse the app first and create an account when you are ready to save preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
            <div>
              <p className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100">
                What you get
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Profile depth</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Rank, role, region, schedule, and style preferences help teammates find a better match before the first invite.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Live LFG board</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Browse active posts with trust context, role needs, and tone signals instead of random lobby luck.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Squad memory</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Repeat sessions, clips, and recurring teammates keep strong groups together over time.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(59,130,246,0.18),rgba(15,23,42,0.4))] p-5">
              <p className="text-sm font-semibold text-white">Ready to join?</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Create an account to save your profile and preferences, or close this guide and keep exploring as a guest.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  onClick={dismiss}
                >
                  Sign up
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={dismiss}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/10"
                >
                  Explore without an account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}