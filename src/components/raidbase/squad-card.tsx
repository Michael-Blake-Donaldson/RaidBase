import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SquadCardProps = {
  id: string;
  name: string;
  game: string;
  members: number;
  openRoles: string[];
  synergy: number;
  status: string;
  activity: string;
  privacy: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
  href?: string;
};

export function SquadCard({
  id,
  name,
  game,
  members,
  openRoles,
  synergy,
  status,
  activity,
  privacy,
  href,
}: SquadCardProps) {
  const privacyVariant = privacy === "PUBLIC" ? "success" : privacy === "INVITE_ONLY" ? "warn" : "neutral";

  const content = (
    <article className="rb-surface-strong rounded-[28px] p-6 transition hover:shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="rb-text-strong text-xl font-semibold">{name}</h3>
          <p className="rb-text-muted mt-1 flex items-center gap-1.5 text-sm">
            <Users className="h-3.5 w-3.5" />
            {game} • {members} members • {status}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="info">{synergy}% synergy</Badge>
          <Badge variant={privacyVariant}>{privacy.replace("_", " ").toLowerCase()}</Badge>
        </div>
      </div>

      <p className="rb-text-body mt-4 text-sm leading-7">{activity}</p>

      {openRoles.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {openRoles.map((role) => (
            <span key={role} className="rb-pill rounded-full px-3 py-1 text-xs">
              {role}
            </span>
          ))}
        </div>
      ) : (
        <p className="rb-text-muted mt-4 text-xs">No open roles</p>
      )}
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
