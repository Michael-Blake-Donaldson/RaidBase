import { ClipsUploader } from "@/components/clips-uploader";
import { SiteShell } from "@/components/site-shell";
import { ClipCard } from "@/components/raidbase";
import { EmptyState } from "@/components/states";
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
      <div className="space-y-6">
        <ClipsUploader />

        <div className="grid gap-6 lg:grid-cols-3">
        {featuredClips.length === 0 ? (
          <div className="lg:col-span-3">
            <EmptyState title="No clips yet" description="Upload your first highlight to showcase your skill." />
          </div>
        ) : (
          featuredClips.map((clip) => (
            <ClipCard
              key={clip.title}
              title={clip.title}
              player={clip.player}
              game={clip.game}
              duration={clip.duration}
              views={clip.views}
              mood={clip.mood}
              url={clip.url}
              provider={clip.provider}
            />
          ))
        )}
        </div>
      </div>
    </SiteShell>
  );
}