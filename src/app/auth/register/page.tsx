import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";
import { getServerAuthSession } from "@/lib/auth/session";

export default async function RegisterPage() {
  const session = await getServerAuthSession();

  if (session?.user?.id) {
    redirect("/settings");
  }

  return (
    <main className="rb-auth-page px-4 py-10">
      <div className="rb-auth-card mx-auto max-w-md rounded-[28px] p-6">
        <p className="rb-badge-success inline-flex rounded-full px-3 py-1 text-xs font-medium">
          Create account
        </p>
        <h1 className="rb-text-strong mt-4 text-3xl font-semibold">Build your Raidbase profile</h1>
        <p className="rb-text-body mt-2 text-sm">Create your account and jump directly into profile and trust setup.</p>
        <RegisterForm />
      </div>
    </main>
  );
}
