import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret:
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "raidbase-dev-only-secret"),
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
      async authorize(input) {
        const parsed = credentialsSchema.safeParse(input);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });

        if (!user || !user.passwordHash || user.status !== "ACTIVE") {
          return null;
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          return null;
        }

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
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
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
