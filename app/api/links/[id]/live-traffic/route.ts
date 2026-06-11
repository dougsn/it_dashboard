import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { resolveRouterosCredentials } from "@/lib/crypto";
import { checkLinkTraffic } from "@/worker/monitors/link-traffic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  const link = await db.link.findUnique({
    where: { id },
    include: { mikrotikDevice: true },
  });

  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  if (!link.mikrotikDevice || !link.mikrotikInterface) {
    return NextResponse.json(
      { error: "Este link não tem Mikrotik ou interface configurados" },
      { status: 422 },
    );
  }

  const creds = resolveRouterosCredentials(link.mikrotikDevice);
  if (!creds) {
    return NextResponse.json(
      { error: `Dispositivo "${link.mikrotikDevice.name}" não tem credenciais RouterOS configuradas` },
      { status: 422 },
    );
  }

  try {
    const result = await checkLinkTraffic(
      link.mikrotikDevice.ip,
      creds.user,
      creds.pass,
      link.mikrotikDevice.routerosPort,
      link.mikrotikInterface,
    );
    return NextResponse.json({
      downloadBps: result.downloadBps,
      uploadBps: result.uploadBps,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Falha ao medir tráfego: ${msg}` }, { status: 422 });
  }
}
