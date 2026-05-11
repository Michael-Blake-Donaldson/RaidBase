import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getServerAuthSession } from "@/lib/auth/session";

export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  emailVerifiedAt: Date | null;
};

/**
 * Retrieves the currently authenticated user and enforces account status rules.
 *
 * Throws AppError with appropriate status codes when:
 *  - User is not signed in (401)
 *  - Account is banned or suspended (403)
 *  - Email is not verified and allowUnverified is false (403)
 *
 * Usage:
 *   const user = await requireUser();
 *   const user = await requireUser({ allowUnverified: true }); // for verify-email flow
 */
export async function requireUser(options?: {
  allowUnverified?: boolean;
}): Promise<AuthenticatedUser> {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    throw new AppError("UNAUTHORIZED", "You must be signed in.", 401);
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) {
    throw new AppError("UNAUTHORIZED", "Account not found.", 401);
  }

  if (user.status === "BANNED") {
    throw new AppError("FORBIDDEN", "This account has been banned.", 403);
  }

  if (user.status === "SUSPENDED") {
    throw new AppError("FORBIDDEN", "This account is currently suspended.", 403);
  }

  if (!options?.allowUnverified && !user.emailVerifiedAt) {
    throw new AppError(
      "EMAIL_UNVERIFIED",
      "Please verify your email address before continuing.",
      403,
    );
  }

  return user;
}

/**
 * Like requireUser but additionally checks that the user has moderator or admin role.
 */
export async function requireModerator(): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!["MODERATOR", "ADMIN", "OWNER"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "You do not have permission to perform this action.", 403);
  }
  return user;
}

/**
 * Like requireUser but additionally checks that the user has admin or owner role.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireUser();
  if (!["ADMIN", "OWNER"].includes(user.role)) {
    throw new AppError("FORBIDDEN", "You do not have permission to perform this action.", 403);
  }
  return user;
}
