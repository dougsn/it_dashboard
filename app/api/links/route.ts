import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { generateWebhookToken } from "@/lib/webhook";
import { parseBody } from "@/lib/parse-body";

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
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await parseBody(req);
  if (!raw.ok) return raw.response;
  const parsed = createSchema.safeParse(raw.data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const link = await db.link.create({ data: parsed.data });
  return NextResponse.json(link, { status: 201 });
}
