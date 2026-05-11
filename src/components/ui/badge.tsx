type Variant = "info" | "success" | "warn" | "danger" | "neutral";

type BadgeProps = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

const variantClass: Record<Variant, string> = {
  info: "rb-badge-info",
  success: "rb-badge-success",
  warn: "rb-badge-warn",
  danger: "rb-badge-danger",
  neutral: "rb-pill",
};

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
        variantClass[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
