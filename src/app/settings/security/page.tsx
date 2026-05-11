import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "Security — RaidBase",
};

export default async function SecurityPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=%2Fsettings%2Fsecurity");
  }

  return (
    <SiteShell
      activePath="/settings"
      eyebrow="Security"
      title="Keep your account protected."
      description="Change your password and manage account security settings."
    >
      <section className="rb-surface-strong max-w-lg rounded-[28px] p-6">
        <h2 className="rb-text-strong text-xl font-semibold">Change password</h2>
        <p className="rb-text-body mt-1 text-sm">
          Your password must be at least 8 characters. Use a strong, unique password.
        </p>
        <ChangePasswordForm />
      </section>
    </SiteShell>
  );
}
