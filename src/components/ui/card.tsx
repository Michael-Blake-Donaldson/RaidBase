import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "soft" | "strong";
  as?: "article" | "div" | "section";
};

const variantClass = {
  default: "rb-surface",
  soft: "rb-surface-soft",
  strong: "rb-surface-strong",
};

export function Card({ children, className = "", variant = "strong", as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={[
        "rounded-[28px] p-6",
        variantClass[variant],
        className,
      ].join(" ")}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={["mb-5", className].join(" ")}>{children}</div>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={["rb-text-strong mt-2 text-2xl font-semibold", className].join(" ")}>
      {children}
    </h3>
  );
}

export function CardEyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={["rb-text-muted text-xs uppercase tracking-[0.28em]", className].join(" ")}>
      {children}
    </p>
  );
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
