import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getServerAuthSession } from "@/lib/auth/session";

export default async function SignInPage() {
  const session = await getServerAuthSession();

  if (session?.user?.id) {
    redirect("/settings");
  }

  return (
    <main className="rb-auth-page px-4 py-10">
      <div className="rb-auth-card mx-auto max-w-md rounded-[28px] p-6">
        <p className="rb-badge-info inline-flex rounded-full px-3 py-1 text-xs font-medium">
          Secure sign in
        </p>
        <h1 className="rb-text-strong mt-4 text-3xl font-semibold">Welcome back to Raidbase</h1>
        <p className="rb-text-body mt-2 text-sm">Sign in with your credentials to access settings, posting, and squad controls.</p>
        <SignInForm />
      </div>
    </main>
  );
}
