import { BellRing, CreditCard, Shield, UserRoundX } from "lucide-react";

import { SiteShell } from "@/components/site-shell";
import { trustControls } from "@/lib/site-data";

const settingsAreas = [
  {
    title: "Privacy and trust",
    icon: Shield,
    description: "Control profile visibility, review exposure thresholds, and who can reach you through invites or posts.",
  },
  {
    title: "Blocked users",
    icon: UserRoundX,
    description: "Keep reviews, invitations, and squad requests hidden from users you do not want interacting with.",
  },
  {
    title: "Notifications",
    icon: BellRing,
    description: "Tune in-app alerts now, then expand to email digests and Discord webhook destinations later.",
  },
  {
    title: "Billing",
    icon: CreditCard,
    description: "Reserve space for Stripe-managed subscriptions, customer portal access, and plan changes.",
  },
];

export default function SettingsPage() {
  return (
    <SiteShell
      activePath="/settings"
      eyebrow="Settings"
      title="Trust, privacy, billing, and notifications belong in one place."
      description="A public-facing product needs clear controls before launch. The MVP settings surface consolidates the flows that keep identity, safety, and monetization understandable."
    >
      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="grid gap-4 sm:grid-cols-2">
          {settingsAreas.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <Icon className="h-5 w-5 text-cyan-200" />
                <h2 className="mt-4 text-xl font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              </article>
            );
          })}
        </section>

        <aside className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Launch safeguards</h2>
          {trustControls.map((item) => (
            <div key={item} className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">
              {item}
            </div>
          ))}
        </aside>
      </div>
    </SiteShell>
  );
}