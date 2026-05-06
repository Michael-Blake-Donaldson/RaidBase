export default function SettingsLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="h-[32rem] animate-pulse rounded-[28px] bg-white/10" />
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-[28px] bg-white/10" />
        <div className="h-40 animate-pulse rounded-[28px] bg-white/10" />
        <div className="h-36 animate-pulse rounded-[28px] bg-white/10" />
      </div>
    </div>
  );
}
