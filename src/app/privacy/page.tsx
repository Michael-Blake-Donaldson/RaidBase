import { SiteShell } from "@/components/site-shell";

const sections = [
  {
    title: "Identity and account data",
    body: "Raidbase stores account details such as email address, username, authentication method, region, timezone, and profile content needed to operate the service.",
  },
  {
    title: "Gameplay and reputation signals",
    body: "Session history, reviews, clips, squad membership, and moderation reports are processed to provide discovery, trust, safety, and compatibility features.",
  },
  {
    title: "Operational telemetry",
    body: "Product analytics, error monitoring, and security logs are retained to improve reliability, protect users, and investigate abuse or fraud.",
  },
  {
    title: "User controls",
    body: "Users can manage privacy visibility, blocked accounts, notification preferences, billing state, account data export, and account deletion from the settings surface. Sensitive moderation notes are not published publicly.",
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell
      activePath="/privacy"
      eyebrow="Privacy"
      title="A trust product needs an explicit data posture."
      description="This policy explains the categories of data Raidbase handles and the controls users should expect in a production release."
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