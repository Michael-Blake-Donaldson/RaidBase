type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "rb-skeleton animate-pulse rounded-xl",
        className,
      ].join(" ")}
    />
  );
}

export function SkeletonText({ lines = 2, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={["space-y-2", className].join(" ")} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={["h-4", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"].join(" ")}
        />
      ))}
    </div>
  );
}
