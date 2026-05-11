import { SiteShell } from "@/components/site-shell";

const sections = [
  {
    title: "Respect teammates",
    body: "Harassment, hate speech, threats, and targeted abuse are never allowed. Keep comms focused on gameplay and treat every player with respect.",
  },
  {
    title: "No cheating or account abuse",
    body: "Do not use cheats, boosting services, impersonation, or account sharing to manipulate ranking, trust, or squad recruitment outcomes.",
  },
  {
    title: "No spam or malicious links",
    body: "Avoid repeated off-platform promotion, scam links, and deceptive content. Suspicious behavior may trigger moderation review and account restrictions.",
  },
  {
    title: "Content standards",
    body: "Do not upload or share illegal, explicit, or exploitative content. Report unsafe behavior through in-product reporting so moderators can act quickly.",
  },
  {
    title: "Enforcement",
    body: "Moderators may warn, hide content, suspend, or ban accounts based on severity and repeat behavior. Appeals should be submitted through support.",
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <SiteShell
      activePath="/community-guidelines"
      eyebrow="Community"
      title="Competitive intensity is welcome. Abuse is not."
      description="These guidelines define expected behavior for players, squads, and content creators using Raidbase."
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
