import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookToken } from "@/lib/webhook";

async function handleDown(req: Request, id: string) {
  const url = new URL(req.url);
  const token =
    req.headers.get("x-webhook-token") ?? url.searchParams.get("token") ?? "";

  if (!verifyWebhookToken(id, token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const link = await db.link.findUnique({ where: { id } });
  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });

  const now = new Date();

  if (link.isOnline) {
    await db.$transaction([
      db.linkEvent.create({ data: { linkId: id, type: "DOWN", timestamp: now } }),
      db.link.update({ where: { id }, data: { isOnline: false, lastEventAt: now } }),
    ]);
  }

  return NextResponse.json({ ok: true, status: "down" });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleDown(req, id);
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleDown(req, id);
}
