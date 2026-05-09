import { AlertTriangle, ShieldAlert, TimerReset } from "lucide-react";

import { ModerationQueuePanel } from "@/components/admin/moderation-queue-panel";
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
        <ModerationQueuePanel initialReports={moderationQueue} />

        <aside className="rb-surface-strong space-y-4 rounded-[28px] p-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="rb-icon h-5 w-5" />
            <h2 className="rb-text-strong text-xl font-semibold">Moderation principles</h2>
          </div>
          <div className="rb-surface-soft rb-text-body rounded-[22px] p-4 text-sm leading-7">
            Aggregated reputation stays public; direct negative comments stay operational. That reduces dogpiling while keeping useful signals intact.
          </div>
          <div className="rb-surface-soft rb-text-body rounded-[22px] p-4 text-sm leading-7">
            Reviewer trust, duplicate detection, rate limits, and burst analysis make abuse visible before it reshapes public trust surfaces.
          </div>
          <div className="rb-badge-info rounded-[22px] p-4 text-sm leading-7">
            <div className="mb-2 flex items-center gap-2">
              <TimerReset className="h-4 w-4" />
              Moderator SLA target
            </div>
            High-severity queues should be reviewed inside 30 minutes during peak hours.
          </div>
          <div className="rb-badge-danger rounded-[22px] p-4 text-sm leading-7">
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