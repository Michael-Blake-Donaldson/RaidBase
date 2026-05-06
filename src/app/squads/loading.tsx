export default function SquadsLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4">
        <div className="h-52 animate-pulse rounded-[28px] bg-white/10" />
        <div className="h-52 animate-pulse rounded-[28px] bg-white/10" />
      </div>
      <div className="h-72 animate-pulse rounded-[28px] bg-white/10" />
    </div>
  );
}
