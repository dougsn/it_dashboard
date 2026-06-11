import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { checkLinkTraffic } from "@/worker/monitors/link-traffic";
import { resolveRouterosCredentials } from "@/lib/crypto";
import { parseBody } from "@/lib/parse-body";

const schema = z.object({
  mikrotikDeviceId: z.string().min(1),
  mikrotikInterface: z.string().min(1),
});

export async function POST(req: Request) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const raw = await parseBody(req);
  if (!raw.ok) return raw.response;
  const parsed = schema.safeParse(raw.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const { mikrotikDeviceId, mikrotikInterface } = parsed.data;

  const device = await db.device.findUnique({ where: { id: mikrotikDeviceId } });
  if (!device) {
    return NextResponse.json({ error: "Dispositivo não encontrado" }, { status: 404 });
  }
  const creds = resolveRouterosCredentials(device);
  if (!device.routerosEnabled || !creds) {
    return NextResponse.json(
      { error: `Dispositivo "${device.name}" não tem RouterOS API habilitado ou credenciais configuradas` },
      { status: 422 },
    );
  }

  try {
    const result = await checkLinkTraffic(
      device.ip,
      creds.user,
      creds.pass,
      device.routerosPort,
      mikrotikInterface,
    );
    return NextResponse.json({ ok: true, downloadBps: result.downloadBps, uploadBps: result.uploadBps });
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : String(err);

    // Map common RouterOS errors to user-friendly messages
    let message = `Falha ao conectar: ${raw}`;
    if (/ECONNREFUSED|ECONNRESET|ETIMEDOUT|timeout/i.test(raw)) {
      message = `Não foi possível conectar ao Mikrotik ${device.ip}:${device.routerosPort} — verifique IP, porta e se a API RouterOS está habilitada`;
    } else if (/auth|login|password|user/i.test(raw)) {
      message = `Credenciais inválidas para ${device.name} — verifique usuário e senha do RouterOS`;
    } else if (/não encontrada|not found|no such interface|invalid value/i.test(raw)) {
      message = `Interface "${mikrotikInterface}" não encontrada em ${device.name} — verifique o nome exato (ex: ether1, sfp-sfpplus1, bridge)`;
    }

    return NextResponse.json({ error: message }, { status: 422 });
  }
}
