import { SiteShell } from "@/components/site-shell";

const sections = [
  {
    title: "Acceptable use",
    body: "Users may not impersonate others, harass teammates, spam off-platform links, manipulate reputation systems, or evade moderation actions.",
  },
  {
    title: "User content",
    body: "Players retain ownership of their clips and profile content but grant Raidbase permission to display, moderate, and process that content for product operation.",
  },
  {
    title: "Reputation and moderation",
    body: "Raidbase may limit visibility, remove content, suspend accounts, or require verification when behavior or reports indicate risk to the community.",
  },
  {
    title: "Paid plans",
    body: "Pro subscriptions expand discovery and customization features. Billing, renewal, and cancellation behavior are managed through the payment provider portal and synchronized back into the product through verified webhook handling.",
  },
];

export default function TermsPage() {
  return (
    <SiteShell
      activePath="/terms"
      eyebrow="Terms"
      title="Public launch requires clear operating rules."
      description="This terms surface defines the baseline conduct, moderation, and subscription rules expected for a reputation-driven gaming platform."
    >
      <div className="grid gap-4">
        {sections.map((section) => (
          <article key={section.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{section.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{section.body}</p>
          </article>
        ))}
      </div>
    </SiteShell>
  );
}