import Link from "next/link";

type SearchParams = Promise<{ token?: string }>;

export default async function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams;

  let status: "loading" | "success" | "error" = "error";
  let message = "This verification link is invalid or has expired.";

  if (token) {
    try {
      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
        cache: "no-store",
      });
      if (response.ok) {
        status = "success";
        message = "Your email has been verified. You can now sign in.";
      }
    } catch {
      // network / server error — keep error status
    }
  }

  return (
    <main className="rb-auth-page px-4 py-10">
      <div className="rb-auth-card mx-auto max-w-md rounded-[28px] p-6">
        {status === "success" ? (
          <>
            <p className="rb-badge-success inline-flex rounded-full px-3 py-1 text-xs font-medium">Email verified</p>
            <h1 className="rb-text-strong mt-4 text-3xl font-semibold">You&apos;re all set</h1>
            <p className="rb-text-body mt-2 text-sm">{message}</p>
            <Link href="/auth/sign-in" className="rb-button-primary mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold">
              Sign in
            </Link>
          </>
        ) : (
          <>
            <p className="rb-badge-error inline-flex rounded-full px-3 py-1 text-xs font-medium">Verification failed</p>
            <h1 className="rb-text-strong mt-4 text-3xl font-semibold">Link invalid or expired</h1>
            <p className="rb-text-body mt-2 text-sm">{message}</p>
            <p className="rb-text-body mt-4 text-sm">
              Return to{" "}
              <Link href="/auth/sign-in" className="font-medium text-blue-600 underline dark:text-blue-300">
                sign in
              </Link>{" "}
              or{" "}
              <Link href="/auth/register" className="font-medium text-blue-600 underline dark:text-blue-300">
                create a new account
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </main>
  );
}
