import { AlertTriangle, ShieldAlert, TimerReset } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { readModerationQueue } from "@/server/queries/content";

export default async function AdminPage() {
  const moderationQueue = await readModerationQueue();

  return (
    <SiteShell
      activePath="/admin"
      eyebrow="Admin moderation"
      title="Moderation has to be first-class, not an afterthought."
      description="The MVP ships with report queues, user status context, and trust-risk signals so reputation cannot be weaponized without operational visibility."
    >
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-4">
          {moderationQueue.map((report) => (
            <article key={report.subject} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Report target</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{report.subject}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  report.severity === "High"
                    ? "border border-rose-300/20 bg-rose-300/10 text-rose-100"
                    : report.severity === "Medium"
                      ? "border border-amber-300/20 bg-amber-300/10 text-amber-100"
                      : "border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
                }`}>
                  {report.severity} severity
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-300">{report.reason}</p>
              <div className="mt-4 rounded-[22px] border border-white/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">
                {report.evidence}
              </div>
              <p className="mt-4 text-sm text-slate-400">Current status: {report.status}</p>
            </article>
          ))}
        </section>

        <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-cyan-200" />
            <h2 className="text-xl font-semibold text-white">Moderation principles</h2>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">
            Aggregated reputation stays public; direct negative comments stay operational. That reduces dogpiling while keeping useful signals intact.
          </div>
          <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">
            Reviewer trust, duplicate detection, rate limits, and burst analysis make abuse visible before it reshapes public trust surfaces.
          </div>
          <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-7 text-cyan-100">
            <div className="mb-2 flex items-center gap-2">
              <TimerReset className="h-4 w-4" />
              Moderator SLA target
            </div>
            High-severity queues should be reviewed inside 30 minutes during peak hours.
          </div>
          <div className="rounded-[22px] border border-rose-300/20 bg-rose-300/10 p-4 text-sm leading-7 text-rose-100">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Public launch rule
            </div>
            No public trust product ships without a staffed moderation queue and audit trail.
          </div>
        </aside>
      </div>
    </SiteShell>
  );
}