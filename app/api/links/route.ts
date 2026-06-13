export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAuth, requireRole } from "@/lib/with-auth";
import { generateWebhookToken } from "@/lib/webhook";
import { parseAndValidate } from "@/lib/parse-body";
import { writeAudit } from "@/lib/audit";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  mikrotikDeviceId: z.string().optional().nullable(),
  mikrotikInterface: z.string().max(50).optional().nullable(),
  contractedDownloadBps: z.number().int().positive().optional().nullable(),
  contractedUploadBps: z.number().int().positive().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { searchParams } = new URL(req.url);
  const rawPage  = searchParams.get("page");
  const rawLimit = searchParams.get("limit");

  const orderBy = { createdAt: "desc" as const };
  const include = { _count: { select: { events: true } } };
  const addTokens = (links: Awaited<ReturnType<typeof db.link.findMany>>) =>
    links.map((link) => ({ ...link, webhookToken: generateWebhookToken(link.id) }));

  const paginate = rawPage !== null || rawLimit !== null;
  const limit = Math.min(Math.max(parseInt(rawLimit ?? "50", 10) || 50, 1), 200);
  const page  = Math.max(parseInt(rawPage  ?? "1",  10) || 1, 1);

  if (paginate) {
    const [links, total] = await Promise.all([
      db.link.findMany({ orderBy, include, skip: (page - 1) * limit, take: limit }),
      db.link.count(),
    ]);
    return NextResponse.json(addTokens(links), { headers: { "X-Total-Count": String(total) } });
  }

  const links = await db.link.findMany({ orderBy, include });
  return NextResponse.json(addTokens(links));
}

export async function POST(req: Request) {
  const unauth = await requireRole("OPERADOR");
  if (unauth) return unauth;
  const body = await parseAndValidate(req, createSchema);
  if (!body.ok) return body.response;

  const link = await db.link.create({ data: body.data });
  void writeAudit({ action: "CREATE", entity: "Link", entityId: link.id, entityName: link.name, details: { location: link.location } });
  return NextResponse.json(link, { status: 201 });
}
