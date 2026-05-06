import { Film, Flame, Trophy } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { featuredClips } from "@/lib/site-data";

export default function ClipsPage() {
  return (
    <SiteShell
      activePath="/clips"
      eyebrow="Clip showcase"
      title="Show actual proof, not self-reported skill."
      description="Clips give context to rank, role, and reputation. The MVP supports embedded proof and featured showcases, with expanded slots and carousels reserved for Pro."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {featuredClips.map((clip) => (
          <article key={clip.title} className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
            <div className="flex aspect-video items-end bg-[linear-gradient(135deg,rgba(45,168,255,0.35),rgba(139,92,255,0.25),rgba(5,11,20,0.65))] p-5">
              <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
                {clip.mood}
              </span>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <h2 className="text-xl font-semibold text-white">{clip.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{clip.player} • {clip.game}</p>
              </div>
              <div className="grid gap-3 text-sm text-slate-300">
                <div className="flex items-center gap-2 rounded-[20px] border border-white/10 bg-slate-950/45 p-3">
                  <Film className="h-4 w-4 text-cyan-200" />
                  {clip.duration} highlight length
                </div>
                <div className="flex items-center gap-2 rounded-[20px] border border-white/10 bg-slate-950/45 p-3">
                  <Flame className="h-4 w-4 text-cyan-200" />
                  {clip.views} showcase views
                </div>
                <div className="flex items-center gap-2 rounded-[20px] border border-white/10 bg-slate-950/45 p-3">
                  <Trophy className="h-4 w-4 text-cyan-200" />
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