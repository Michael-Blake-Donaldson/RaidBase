import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "rb-surface-soft flex flex-col items-center justify-center rounded-[28px] px-6 py-16 text-center",
        className,
      ].join(" ")}
    >
      <span className="rb-text-muted mb-4">
        {icon ?? <Inbox className="h-10 w-10" />}
      </span>
      <h3 className="rb-text-strong text-lg font-semibold">{title}</h3>
      {description ? (
        <p className="rb-text-muted mt-2 max-w-sm text-sm leading-7">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
