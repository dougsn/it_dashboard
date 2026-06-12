export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { parseBody } from "@/lib/parse-body";
import { z } from "zod";

const configSchema = z.object({
  statusHistoryDays: z.number().int().min(1).max(365),
  linkEventDays: z.number().int().min(1).max(365),
});

export async function GET() {
  const unauth = await requireRole("ADMIN");
  if (unauth) return unauth;

  const config = await db.systemConfig.upsert({
    where: { id: 1 },
    create: { id: 1, statusHistoryDays: 30, linkEventDays: 90 },
    update: {},
  });

  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const unauth = await requireRole("ADMIN");
  if (unauth) return unauth;

  const parsed = await parseBody(req);
  if (!parsed.ok) return parsed.response;

  const result = configSchema.safeParse(parsed.data);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const config = await db.systemConfig.upsert({
    where: { id: 1 },
    create: { id: 1, ...result.data },
    update: result.data,
  });

  return NextResponse.json(config);
}
