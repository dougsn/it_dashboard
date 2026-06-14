import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { runChecks } from "@/worker/scheduler";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // SEC-029: force-check triggers active network operations — restrict to OPERADOR+
  const unauth = await requireRole("OPERADOR");
  if (unauth) return unauth;

  const { id } = await params;
  const device = await db.device.findUnique({ where: { id } });
  if (!device) return NextResponse.json({ error: "Dispositivo não encontrado" }, { status: 404 });

  await runChecks(device).catch(() => {});

  return NextResponse.json({ ok: true });
}
