import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getServerAuthSession } from "@/lib/auth/session";

export default async function SignInPage() {
  const session = await getServerAuthSession();

  if (session?.user?.id) {
    redirect("/settings");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(54,224,255,0.14),_transparent_34%),linear-gradient(180deg,#07111f_0%,#081426_48%,#050b14_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-md rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
        <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/12 px-3 py-1 text-xs font-medium text-cyan-100">
          Secure sign in
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Welcome back to Raidbase</h1>
        <p className="mt-2 text-sm text-slate-300">Sign in with your credentials to access settings, posting, and squad controls.</p>
        <SignInForm />
      </div>
    </main>
  );
}
