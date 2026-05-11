import Link from "next/link";
import { Mic, MicOff, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type LfgCardProps = {
  id: string;
  title: string;
  game: string;
  region: string;
  rank: string;
  roles: string[];
  schedule: string;
  tone: string;
  micRequired: boolean;
  openSpots: number;
  href?: string;
};

export function LfgCard({
  id,
  title,
  game,
  region,
  rank,
  roles,
  schedule,
  tone,
  micRequired,
  openSpots,
  href,
}: LfgCardProps) {
  const content = (
    <article className="rb-surface-strong rounded-[28px] p-6 transition hover:shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="rb-text-strong text-lg font-semibold">{title}</h3>
          <p className="rb-text-muted mt-1 text-sm">
            {game} • {region} • {rank}
          </p>
        </div>
        <Badge variant={openSpots > 0 ? "success" : "danger"}>
          {openSpots > 0 ? `${openSpots} open` : "Full"}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {roles.map((role) => (
          <span key={role} className="rb-pill rounded-full px-3 py-1 text-xs">
            {role}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
        <span className="rb-text-body flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {schedule}
        </span>
        <span className="rb-text-muted">{tone}</span>
        <span className="rb-text-body flex items-center gap-1">
          {micRequired ? (
            <>
              <Mic className="h-3.5 w-3.5 text-blue-500" /> Mic required
            </>
          ) : (
            <>
              <MicOff className="h-3.5 w-3.5" /> Mic optional
            </>
          )}
        </span>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-[28px]">
        {content}
      </Link>
    );
  }

  return content;
}
