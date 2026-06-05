import type { NextAuthConfig } from "next-auth";

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  throw new Error(
    "NEXTAUTH_SECRET não está definido. Defina a variável de ambiente antes de iniciar a aplicação."
  );
}

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret,
  trustHost: true,
  providers: [],
} satisfies NextAuthConfig;
