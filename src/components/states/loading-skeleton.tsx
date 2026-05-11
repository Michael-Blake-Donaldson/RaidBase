import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rb-surface-strong rounded-[28px] p-6 space-y-4" aria-hidden="true">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <SkeletonText lines={2} />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading content">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <CardSkeleton count={3} />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading list">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rb-surface-soft flex items-center gap-4 rounded-2xl p-4" aria-hidden="true">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
