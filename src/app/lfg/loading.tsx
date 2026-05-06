export default function LfgLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <div className="h-72 animate-pulse rounded-[28px] bg-white/10" />
      <div className="grid gap-4">
        <div className="h-52 animate-pulse rounded-[28px] bg-white/10" />
        <div className="h-52 animate-pulse rounded-[28px] bg-white/10" />
      </div>
    </div>
  );
}
