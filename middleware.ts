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

async function isRateLimited(req: NextRequest, ip: string): Promise<boolean> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return false; // fail open if misconfigured
  try {
    const origin = req.nextUrl.origin;
    const res = await fetch(`${origin}/api/auth/rate-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secret}`,
      },
      body: JSON.stringify({ ip }),
    });
    if (!res.ok) return false;
    const data = await res.json() as { allowed?: boolean };
    return data.allowed === false;
  } catch {
    return false; // fail open on network error
  }
}

function buildCsp(nonce: string): string {
  const isProd = process.env.NODE_ENV === "production";
  return [
    "default-src 'self'",
    // SEC-020: nonce + strict-dynamic replaces unsafe-inline in production.
    // strict-dynamic propagates trust to scripts loaded by trusted scripts (Next.js hydration).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isProd ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
  ].join("; ");
}

export async function middleware(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp   = buildCsp(nonce);

  // Forward the nonce on the *request* headers so Next.js applies it to its own
  // inline scripts (and server components can read it via headers()). Without this
  // the nonce only reaches the browser, not Next's renderer, and every inline
  // script — including next-themes' anti-flash script — gets blocked by the CSP.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("Content-Security-Policy", csp);
  requestHeaders.set("X-Nonce", nonce);
  const passThrough = () => NextResponse.next({ request: { headers: requestHeaders } });

  let response: NextResponse;

  // Rate limit login attempts before NextAuth processes them
  if (req.method === "POST" && req.nextUrl.pathname === "/api/auth/callback/credentials") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";
    if (await isRateLimited(req, ip)) {
      response = NextResponse.json(
        { error: "Muitas tentativas de login. Aguarde 15 minutos." },
        { status: 429 }
      );
    } else {
      response = passThrough();
    }
  } else {
    // Session enforcement — cast needed: NextAuth's `auth` expects NextAuthRequest
    const authFn = auth as unknown as (req: NextRequest) => Promise<NextResponse | null>;
    const authResponse = await authFn(req);
    // A redirect/rewrite means the request was rejected (unauthorized) — pass it
    // through untouched. Otherwise rebuild the pass-through so the nonce reaches
    // the request headers, preserving any cookies the auth layer may have set.
    const isRedirect =
      !!authResponse &&
      (authResponse.headers.has("location") ||
        (authResponse.status >= 300 && authResponse.status < 400));
    if (isRedirect) {
      response = authResponse!;
    } else {
      response = passThrough();
      const setCookies = authResponse?.headers.getSetCookie?.() ?? [];
      for (const cookie of setCookies) response.headers.append("set-cookie", cookie);
    }
  }

  // Inject per-request nonce into CSP on the response too (browser enforcement)
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Nonce", nonce);
  return response;
}

export const config = {
  matcher: [
    // Include credentials callback for rate limiting
    "/api/auth/callback/credentials",
    // Protect all other routes except public ones
    "/((?!api/auth|api/links/[^/]+/(?:down|up)|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
