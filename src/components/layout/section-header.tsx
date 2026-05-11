import type { ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  cta?: ReactNode;
  className?: string;
};

export function SectionHeader({ eyebrow, title, cta, className = "" }: SectionHeaderProps) {
  return (
    <div className={["mb-5 flex items-center justify-between gap-4", className].join(" ")}>
      <div>
        {eyebrow ? (
          <p className="rb-text-muted text-xs uppercase tracking-[0.28em]">{eyebrow}</p>
        ) : null}
        <h3 className="rb-text-strong mt-1 text-2xl font-semibold">{title}</h3>
      </div>
      {cta ? <div>{cta}</div> : null}
    </div>
  );
}
