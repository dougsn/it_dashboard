import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { runChecks } from "@/worker/scheduler";
import { z } from "zod";

const deviceTypeSchema = z.enum(["MIKROTIK", "DVR", "CAMERA", "OTHER", "UNIFI_AP", "OMADA_AP"]);

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { searchParams } = new URL(req.url);
  const rawType = searchParams.get("type");

  if (rawType !== null) {
    const parsed = deviceTypeSchema.safeParse(rawType);
    if (!parsed.success) {
      return NextResponse.json({ error: "Tipo de dispositivo inválido" }, { status: 400 });
    }
  }

  const devices = await db.device.findMany({
    where: rawType ? { type: rawType as z.infer<typeof deviceTypeSchema> } : undefined,
  });

  const results = await Promise.allSettled(devices.map((d) => runChecks(d)));

  const errors = results
    .map((r, i) => r.status === "rejected"
      ? { device: devices[i].name, ip: devices[i].ip, error: r.reason instanceof Error ? r.reason.message : String(r.reason) }
      : null)
    .filter(Boolean);

  return NextResponse.json({ ok: true, checked: devices.length, errors });
}
