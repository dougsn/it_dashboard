import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { resolveOmadaCredentials } from "@/lib/crypto";
import { parseBody } from "@/lib/parse-body";
import { getOmadaToken, listOmadaSites } from "@/worker/monitors/omada";

const schema = z.object({
  controllerIp:      z.string().min(1),
  omadacId:          z.string().min(1),
  tlsVerify:         z.boolean(),
  omadaClientId:     z.string().optional(),
  omadaClientSecret: z.string().optional(),
  deviceId:          z.string().optional(),
});

export async function POST(req: Request) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const raw = await parseBody(req);
  if (!raw.ok) return raw.response;

  const parsed = schema.safeParse(raw.data);
  if (!parsed.success) return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });

  const { controllerIp, omadacId, tlsVerify, deviceId } = parsed.data;
  let clientId     = parsed.data.omadaClientId?.trim()     || null;
  let clientSecret = parsed.data.omadaClientSecret?.trim() || null;

  if ((!clientId || !clientSecret) && deviceId) {
    const device = await db.device.findUnique({
      where: { id: deviceId },
      select: { omadaClientIdEnc: true, omadaClientSecretEnc: true },
    });
    if (device) {
      const creds = resolveOmadaCredentials(device);
      if (creds) { clientId = creds.clientId; clientSecret = creds.clientSecret; }
    }
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Informe client_id e client_secret para testar a conexão" },
      { status: 422 },
    );
  }

  try {
    const token = await getOmadaToken(controllerIp, omadacId, clientId, clientSecret, tlsVerify);
    const sites  = await listOmadaSites(controllerIp, omadacId, token, tlsVerify);

    return NextResponse.json({
      ok: true,
      sites,
      message: sites.length === 0
        ? `Autenticado (omadacId: ${omadacId}). Nenhum site encontrado.`
        : `Autenticado. ${sites.length} site(s) disponível(is).`,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 422 });
  }
}
