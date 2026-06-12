export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireAuth } from "@/lib/with-auth";
import { generateWebhookToken } from "@/lib/webhook";
import { parseAndValidate } from "@/lib/parse-body";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  mikrotikDeviceId: z.string().optional().nullable(),
  mikrotikInterface: z.string().max(50).optional().nullable(),
  contractedDownloadBps: z.number().int().positive().optional().nullable(),
  contractedUploadBps: z.number().int().positive().optional().nullable(),
});

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const links = await db.link.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { events: true } } },
  });

  const withTokens = links.map((link) => ({
    ...link,
    webhookToken: generateWebhookToken(link.id),
  }));

  return NextResponse.json(withTokens);
}

export async function POST(req: Request) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await parseAndValidate(req, createSchema);
  if (!body.ok) return body.response;

  const link = await db.link.create({ data: body.data });
  return NextResponse.json(link, { status: 201 });
}
