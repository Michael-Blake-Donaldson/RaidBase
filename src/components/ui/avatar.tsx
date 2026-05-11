type AvatarProps = {
  src?: string | null;
  displayName?: string | null;
  username?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClass = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

function getInitials(displayName?: string | null, username?: string | null) {
  const name = displayName ?? username ?? "?";
  return name
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ src, displayName, username, size = "md", className = "" }: AvatarProps) {
  const initials = getInitials(displayName, username);
  const label = displayName ?? username ?? "User";

  return (
    <span
      aria-label={label}
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        "rb-surface-soft",
        sizeClass[size],
        className,
      ].join(" ")}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span className="rb-text-strong">{initials}</span>
      )}
    </span>
  );
}
