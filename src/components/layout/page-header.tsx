import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={["flex flex-wrap items-end justify-between gap-4", className].join(" ")}>
      <div>
        {eyebrow ? (
          <p className="rb-pill mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="rb-text-strong text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h1>
        {description ? (
          <p className="rb-text-body mt-2 max-w-2xl text-sm leading-7">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
