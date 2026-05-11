import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { db } from "@/lib/db";
import { getAppBaseUrl, getAuthSecret } from "@/lib/env";
import { enforceRateLimit } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

process.env.NEXTAUTH_SECRET ??= getAuthSecret();
process.env.NEXTAUTH_URL ??= getAppBaseUrl();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: getAuthSecret(),
  logger: {
    error(code, metadata) {
      if (
        code === "JWT_SESSION_ERROR" &&
        typeof metadata?.message === "string" &&
        metadata.message.toLowerCase().includes("decryption operation failed")
      ) {
        return;
      }

      console.error(`[next-auth][${code}]`, metadata);
    },
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(input, req) {
        const parsed = credentialsSchema.safeParse(input);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Rate limit by IP to prevent brute-force
        const ip =
          (req?.headers as Record<string, string | string[] | undefined> | undefined)?.["x-forwarded-for"] ??
          "unknown";
        const ipStr = Array.isArray(ip) ? ip[0] : (ip ?? "unknown");
        const rateLimit = await enforceRateLimit({
          key: `login:${ipStr}`,
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });

        if (!rateLimit.ok) {
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });

        if (!user || !user.passwordHash || user.status === "BANNED" || user.status === "DELETED") {
          return null;
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          return null;
        }

        // Update lastLoginAt asynchronously — don't block sign-in on DB write
        db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }).catch(() => undefined);

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: UserRole }).role ?? "USER";
        token.username = user.name ?? undefined;
        token.active = true;
      }

      if (!token.sub) {
        return token;
      }

      try {
        const currentUser = await db.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            role: true,
            status: true,
            username: true,
          },
        });

        if (!currentUser || currentUser.status === "BANNED" || currentUser.status === "DELETED") {
          delete token.sub;
          delete token.role;
          delete token.username;
          token.active = false;
          return token;
        }

        token.role = currentUser.role;
        token.username = currentUser.username;
        token.active = true;
      } catch {
        // Database unavailable or error; mark token as inactive to prevent stale access
        delete token.sub;
        delete token.role;
        delete token.username;
        token.active = false;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (!token.sub || token.active === false) {
          session.user.id = "";
          session.user.role = "USER";
          session.user.username = "";
          return session;
        }

        session.user.id = token.sub ?? "";
        session.user.role = (token.role as UserRole | undefined) ?? "USER";
        session.user.username = (token.username as string | undefined) ?? session.user.name ?? "";
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
};
