import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});

// In-memory rate limiter for login attempts (suitable for single-instance internal dashboard)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
    return false;
  }
  if (entry.count >= 10) return true;
  entry.count++;
  return false;
}

export async function middleware(req: NextRequest) {
  // Rate limit login attempts before NextAuth processes them
  if (req.method === "POST" && req.nextUrl.pathname === "/api/auth/callback/credentials") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Muitas tentativas de login. Aguarde 15 minutos." },
        { status: 429 }
      );
    }
    return NextResponse.next();
  }

  // Session enforcement for all other protected routes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (auth as any)(req);
}

export const config = {
  matcher: [
    // Include credentials callback for rate limiting
    "/api/auth/callback/credentials",
    // Protect all other routes except public ones
    "/((?!api/auth|api/links/[^/]+/(?:down|up)|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
