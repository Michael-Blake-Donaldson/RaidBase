import Link from "next/link";
import { ShieldOff } from "lucide-react";

type PermissionDeniedProps = {
  title?: string;
  description?: string;
  showSignIn?: boolean;
  className?: string;
};

export function PermissionDenied({
  title = "Access denied",
  description = "You don't have permission to view this page.",
  showSignIn = false,
  className = "",
}: PermissionDeniedProps) {
  return (
    <div
      className={[
        "rb-surface-soft flex flex-col items-center justify-center rounded-[28px] px-6 py-16 text-center",
        className,
      ].join(" ")}
    >
      <ShieldOff className="mb-4 h-10 w-10 text-rose-500" />
      <h3 className="rb-text-strong text-lg font-semibold">{title}</h3>
      <p className="rb-text-muted mt-2 max-w-sm text-sm leading-7">{description}</p>
      {showSignIn ? (
        <Link
          href="/auth/sign-in"
          className="rb-button-primary mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold transition"
        >
          Sign in
        </Link>
      ) : null}
    </div>
  );
}
