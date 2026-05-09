import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import { db } from "@/lib/db";
import { getAppBaseUrl, getAuthSecret } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

process.env.NEXTAUTH_SECRET ??= getAuthSecret();
process.env.NEXTAUTH_URL ??= getAppBaseUrl();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: getAuthSecret(),
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
        token.active = true;
      }

      if (!token.sub) {
        return token;
      }

      const currentUser = await db.user.findUnique({
        where: { id: token.sub },
        select: {
          id: true,
          role: true,
          status: true,
          username: true,
        },
      });

      if (!currentUser || currentUser.status !== "ACTIVE") {
        delete token.sub;
        delete token.role;
        delete token.username;
        token.active = false;
        return token;
      }

      token.role = currentUser.role;
      token.username = currentUser.username;
      token.active = true;

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
