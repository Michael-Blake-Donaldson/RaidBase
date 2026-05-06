export default function ProfileLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <div className="space-y-6">
        <div className="h-72 animate-pulse rounded-[30px] bg-white/10" />
        <div className="h-40 animate-pulse rounded-[28px] bg-white/10" />
      </div>
      <div className="space-y-6">
        <div className="h-36 animate-pulse rounded-[28px] bg-white/10" />
        <div className="h-56 animate-pulse rounded-[28px] bg-white/10" />
      </div>
    </div>
  );
}
