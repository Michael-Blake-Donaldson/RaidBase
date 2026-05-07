import { Film, Flame, Trophy } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { readClips } from "@/server/queries/content";

export default async function ClipsPage() {
  const featuredClips = await readClips();

  return (
    <SiteShell
      activePath="/clips"
      eyebrow="Clip showcase"
      title="Show actual proof, not self-reported skill."
      description="Clips give context to rank, role, and reputation. The MVP supports embedded proof and featured showcases, with expanded slots and carousels reserved for Pro."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {featuredClips.map((clip) => (
          <article key={clip.title} className="rb-surface-strong overflow-hidden rounded-[28px]">
            <div className="flex aspect-video items-end bg-[linear-gradient(135deg,rgba(45,168,255,0.35),rgba(139,92,255,0.25),rgba(5,11,20,0.65))] p-5">
              <span className="rb-badge-info rounded-full px-3 py-1 text-xs uppercase tracking-[0.24em]">
                {clip.mood}
              </span>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <h2 className="rb-text-strong text-xl font-semibold">{clip.title}</h2>
                <p className="rb-text-muted mt-2 text-sm">{clip.player} • {clip.game}</p>
              </div>
              <div className="rb-text-body grid gap-3 text-sm">
                <div className="rb-surface-soft flex items-center gap-2 rounded-[20px] p-3">
                  <Film className="rb-icon h-4 w-4" />
                  {clip.duration} highlight length
                </div>
                <div className="rb-surface-soft flex items-center gap-2 rounded-[20px] p-3">
                  <Flame className="rb-icon h-4 w-4" />
                  {clip.views} showcase views
                </div>
                <div className="rb-surface-soft flex items-center gap-2 rounded-[20px] p-3">
                  <Trophy className="rb-icon h-4 w-4" />
                  Creator spotlight eligible
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}