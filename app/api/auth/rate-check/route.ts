export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function POST(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let ip: string;
  try {
    const body = await req.json() as { ip?: unknown };
    if (typeof body.ip !== "string" || !body.ip) {
      return NextResponse.json({ error: "ip required" }, { status: 400 });
    }
    ip = body.ip;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + WINDOW_MS);

  // Atomic upsert-and-increment (avoids the read-then-write TOCTOU where two
  // concurrent requests from the same IP both start the window at count=1).
  // On conflict: reset to 1 if the previous window expired, otherwise increment.
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("ip", "count", "resetAt")
    VALUES (${ip}, 1, ${windowEnd})
    ON CONFLICT ("ip") DO UPDATE SET
      "count"   = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN ${windowEnd} ELSE "RateLimit"."resetAt" END
    RETURNING "count"
  `;
  const count = Number(rows[0].count);

  const allowed = count <= MAX_ATTEMPTS;
  const remaining = Math.max(0, MAX_ATTEMPTS - count);

  return NextResponse.json({ allowed, remaining });
}
