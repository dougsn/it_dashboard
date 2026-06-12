import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { runChecks } from "@/worker/scheduler";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { id } = await params;
  const device = await db.device.findUnique({ where: { id } });
  if (!device) return NextResponse.json({ error: "Dispositivo não encontrado" }, { status: 404 });

  await runChecks(device).catch(() => {});

  return NextResponse.json({ ok: true });
}
