import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { getServerAuthSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const session = await getServerAuthSession();

  if (session?.user?.id) {
    redirect("/settings");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(54,224,255,0.14),_transparent_34%),linear-gradient(180deg,#07111f_0%,#081426_48%,#050b14_100%)] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-md rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.3)]">
        <p className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/12 px-3 py-1 text-xs font-medium text-emerald-100">
          Create account
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Build your Raidbase profile</h1>
        <p className="mt-2 text-sm text-slate-300">Create your account and jump directly into profile and trust setup.</p>
        <RegisterForm />
      </div>
    </main>
  );
}
