import type { NextAuthConfig } from "next-auth";

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  throw new Error(
    "NEXTAUTH_SECRET não está definido. Defina a variável de ambiente antes de iniciar a aplicação."
  );
}

export const authConfig = {
  pages: { signIn: "/login" },
  // SEC-028: sessão de 8h — razoável para dashboard de uso diurno
  session: { strategy: "jwt", maxAge: 8 * 3600 },
  secret,
  trustHost: true,
  providers: [],
} satisfies NextAuthConfig;
