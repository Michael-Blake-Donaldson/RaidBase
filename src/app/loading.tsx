export default function Loading() {
  return (
    <main className="min-h-screen px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-[1200px] space-y-5">
        <div className="h-7 w-52 animate-pulse rounded-full bg-white/10" />
        <div className="h-12 w-full max-w-3xl animate-pulse rounded-2xl bg-white/10" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-40 animate-pulse rounded-3xl bg-white/10" />
          <div className="h-40 animate-pulse rounded-3xl bg-white/10" />
          <div className="h-40 animate-pulse rounded-3xl bg-white/10" />
        </div>
      </div>
    </main>
  );
}
