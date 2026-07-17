import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

const authSecret = process.env.NEXTAUTH_SECRET ?? "amadeh-pack-local-development-secret-change-in-production";
const isProductionRuntime = process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";

if (isProductionRuntime && !process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is required in production.");
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { roles: { include: { role: true } } },
        });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.roles.some((item) => item.role.name === "admin") ? "admin" : "user",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
