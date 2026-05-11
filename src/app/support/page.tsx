import { SiteShell } from "@/components/site-shell";

const contactPaths = [
  {
    title: "Report abuse or safety issues",
    detail: "Use in-product report actions first for the fastest moderation response. Include clear context and timestamps when possible.",
  },
  {
    title: "Account and billing help",
    detail: "For sign-in, verification, subscription, or payment issues, contact support with your username and request ID if available.",
  },
  {
    title: "Policy and legal requests",
    detail: "For data requests, takedown notices, or policy questions, contact legal support and include relevant links or identifiers.",
  },
];

export default function SupportPage() {
  return (
    <SiteShell
      activePath="/support"
      eyebrow="Support"
      title="Need help or need to report something?"
      description="Use the right support path so account, safety, and policy issues reach the correct team quickly."
    >
      <div className="grid gap-4">
        {contactPaths.map((item) => (
          <article key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{item.detail}</p>
          </article>
        ))}

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">Email: support@raidbase.gg</p>
          <p className="mt-1 text-sm leading-7 text-slate-300">Legal/DMCA: legal@raidbase.gg</p>
        </article>
      </div>
    </SiteShell>
  );
}
