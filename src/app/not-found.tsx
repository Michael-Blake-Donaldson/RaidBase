import Link from "next/link";

import { SiteShell } from "@/components/site-shell";

export default function NotFound() {
  return (
    <SiteShell
      activePath="/"
      eyebrow="Route missing"
      title="This queue never loaded."
      description="The route you requested does not exist, was removed, or needs a different player or squad identifier."
    >
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 lg:p-10">
        <h2 className="font-display text-3xl font-semibold text-white">404</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          Return to the command center, browse live LFG posts, or open a known player profile to keep exploring the MVP surfaces.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
            Command center
          </Link>
          <Link href="/lfg" className="rounded-full border border-white/15 bg-white/6 px-5 py-3 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/10">
            Open LFG board
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}