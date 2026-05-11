type Status = "open" | "full" | "closed" | "expired" | "recruiting" | "invite-only";

type StatusPillProps = {
  status: Status;
  className?: string;
};

const statusConfig: Record<Status, { label: string; className: string }> = {
  open: { label: "Open", className: "rb-badge-success" },
  recruiting: { label: "Recruiting", className: "rb-badge-info" },
  full: { label: "Full", className: "rb-badge-warn" },
  closed: { label: "Closed", className: "rb-pill" },
  expired: { label: "Expired", className: "rb-pill" },
  "invite-only": { label: "Invite Only", className: "rb-badge-warn" },
};

export function StatusPill({ status, className = "" }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        config.className,
        className,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
}
