import { Film, Flame, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ClipCardProps = {
  title: string;
  player: string;
  game: string;
  duration: string;
  views: string;
  mood: string;
  url?: string;
  provider?: string;
  thumbnailGradient?: string;
};

export function ClipCard({
  title,
  player,
  game,
  duration,
  views,
  mood,
  url,
  provider,
  thumbnailGradient = "linear-gradient(135deg, rgba(45,168,255,0.35), rgba(139,92,255,0.25), rgba(5,11,20,0.65))",
}: ClipCardProps) {
  return (
    <article className="rb-surface-strong overflow-hidden rounded-[28px]">
      <div
        className="flex aspect-video items-end p-4"
        style={{ background: thumbnailGradient }}
      >
        <Badge variant="info" className="uppercase tracking-[0.24em]">
          {mood}
        </Badge>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="rb-text-strong text-lg font-semibold">{title}</h3>
          <p className="rb-text-muted mt-1 text-sm">
            {player} • {game}
          </p>
        </div>

        <div className="rb-text-body grid gap-2 text-sm">
          <div className="rb-surface-soft flex items-center gap-2 rounded-[18px] p-3">
            <Film className="rb-icon h-4 w-4 shrink-0" />
            {duration} highlight
          </div>
          <div className="rb-surface-soft flex items-center gap-2 rounded-[18px] p-3">
            <Flame className="rb-icon h-4 w-4 shrink-0" />
            {views} views
          </div>
          <div className="rb-surface-soft flex items-center gap-2 rounded-[18px] p-3">
            <Trophy className="rb-icon h-4 w-4 shrink-0" />
            Creator spotlight eligible
          </div>
        </div>

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="rb-button-subtle inline-flex rounded-full px-4 py-2 text-xs font-medium transition"
          >
            Watch clip{provider ? ` (${provider})` : ""}
          </a>
        ) : null}
      </div>
    </article>
  );
}
