export default function LfgLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <div className="rb-skeleton h-72 animate-pulse rounded-[28px]" />
      <div className="grid gap-4">
        <div className="rb-skeleton h-52 animate-pulse rounded-[28px]" />
        <div className="rb-skeleton h-52 animate-pulse rounded-[28px]" />
      </div>
    </div>
  );
}
