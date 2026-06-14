import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/lib/auth.config";
import { writeAudit, extractIp } from "@/lib/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha", type: "password" },
        totp:     { label: "Código 2FA", type: "text" },
      },
      async authorize(credentials, request) {
        if (!credentials?.username || !credentials?.password) return null;

        const ip = request ? extractIp(request) : null;

        try {
          const user = await db.user.findUnique({
            where: { username: credentials.username as string },
          });

          if (!user) {
            await writeAudit({ action: "LOGIN_FAILED", entity: "Auth", entityName: credentials.username as string, userId: null, username: null, ipAddress: ip });
            return null;
          }

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!valid) {
            await writeAudit({ action: "LOGIN_FAILED", entity: "Auth", entityName: credentials.username as string, userId: null, username: null, ipAddress: ip });
            return null;
          }

          // SEC-009: verify TOTP if enabled
          if (user.totpEnabled && user.totpSecret) {
            const totpToken = (credentials.totp as string | undefined) ?? "";
            if (!totpToken) {
              // TOTP required but not provided — fail silently (login page pre-checks)
              return null;
            }
            const { decryptSecret, verifyTotp } = await import("@/lib/totp");
            const secret = decryptSecret(user.totpSecret);
            if (!(await verifyTotp(totpToken, secret))) {
              await writeAudit({ action: "LOGIN_FAILED", entity: "Auth", entityName: user.username, userId: null, username: null, ipAddress: ip });
              return null;
            }
          }

          await writeAudit({ action: "LOGIN", entity: "Auth", entityId: user.id, entityName: user.username, userId: user.id, username: user.username, ipAddress: ip });
          return { id: user.id, name: user.username, role: user.role };
        } catch (error) {
          console.error("[auth] erro:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        // SEC-021: assign a unique jti (JWT ID) on first token creation
        token.jti = crypto.randomUUID();
      }

      // SEC-021: reject blacklisted tokens (e.g., after explicit logout)
      if (token.jti && typeof token.jti === "string") {
        const blacklisted = await db.tokenBlacklist
          .findUnique({ where: { jti: token.jti } })
          .catch(() => null);
        if (blacklisted) return null;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; id?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
});
