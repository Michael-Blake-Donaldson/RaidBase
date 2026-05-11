import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type PlayerCardProps = {
  username: string;
  displayName?: string | null;
  rank: string;
  role: string;
  region: string;
  synergy?: number;
  reputation?: string[];
  tagline?: string;
  reputationScore?: number;
  href?: string;
};

export function PlayerCard({
  username,
  displayName,
  rank,
  role,
  region,
  synergy,
  reputation,
  tagline,
  reputationScore,
  href,
}: PlayerCardProps) {
  const content = (
    <article className="rb-surface-strong rounded-[28px] p-5 transition hover:shadow-lg">
      <div className="flex items-center gap-4">
        <Avatar displayName={displayName} username={username} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="rb-text-strong font-semibold">{displayName ?? username}</h3>
            {reputationScore !== undefined ? (
              <ReputationBadge score={reputationScore} />
            ) : null}
          </div>
          <p className="rb-text-muted mt-0.5 text-sm">
            @{username} • {rank} • {role} • {region}
          </p>
        </div>
        {synergy !== undefined ? (
          <Badge variant="info">{synergy}% fit</Badge>
        ) : null}
      </div>

      {tagline ? (
        <p className="rb-text-body mt-3 text-sm leading-7">{tagline}</p>
      ) : null}

      {reputation && reputation.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {reputation.map((tag) => (
            <span key={tag} className="rb-pill rounded-full px-3 py-1 text-xs">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );

  const target = href ?? `/profile/${username}`;

  return (
    <Link href={target} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-[28px]">
      {content}
    </Link>
  );
}

// Inline rep badge used in PlayerCard and elsewhere
type RepTier = "risky" | "neutral" | "trusted" | "elite";

function scoreTier(score: number): RepTier {
  if (score >= 80) return "elite";
  if (score >= 60) return "trusted";
  if (score >= 40) return "neutral";
  return "risky";
}

const tierLabel: Record<RepTier, string> = {
  risky: "Risky",
  neutral: "Neutral",
  trusted: "Trusted",
  elite: "Elite",
};

const tierVariant: Record<RepTier, "danger" | "warn" | "success" | "info"> = {
  risky: "danger",
  neutral: "warn",
  trusted: "success",
  elite: "info",
};

export function ReputationBadge({ score, showScore = false }: { score: number; showScore?: boolean }) {
  const tier = scoreTier(score);
  return (
    <Badge variant={tierVariant[tier]}>
      {tierLabel[tier]}{showScore ? ` · ${score}` : ""}
    </Badge>
  );
}
