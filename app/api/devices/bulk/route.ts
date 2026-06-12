import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { bulkDeviceSchema } from "@/lib/schemas/device";
import { encrypt } from "@/lib/crypto";
import { parseAndValidate } from "@/lib/parse-body";
import { writeAudit } from "@/lib/audit";

function ipToInt(ip: string): number | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}

export async function POST(req: NextRequest) {
  const unauth = await requireRole("OPERADOR");
  if (unauth) return unauth;
  const body = await parseAndValidate(req, bulkDeviceSchema);
  if (!body.ok) return body.response;

  const { ipStart, ipEnd, name, routerosUser, routerosPass, unifiApiKey, unifiUser, unifiPass, ...config } = body.data;

  const startInt = ipToInt(ipStart);
  const endInt = ipToInt(ipEnd);

  if (startInt === null || endInt === null) {
    return NextResponse.json({ error: "IPs inválidos" }, { status: 400 });
  }
  if (startInt > endInt) {
    return NextResponse.json({ error: "IP inicial deve ser menor ou igual ao IP final" }, { status: 400 });
  }

  const count = endInt - startInt + 1;
  if (count > 254) {
    return NextResponse.json({ error: "Máximo de 254 dispositivos por operação" }, { status: 400 });
  }

  const ips: string[] = [];
  for (let n = startInt; n <= endInt; n++) {
    ips.push(intToIp(n >>> 0));
  }

  const devices = await db.device.createMany({
    data: ips.map((ip) => ({
      ...config,
      ip,
      name: `${name} ${ip.split(".").pop()}`,
      routerosUserEnc: routerosUser ? encrypt(routerosUser) : null,
      routerosPassEnc: routerosPass ? encrypt(routerosPass) : null,
      unifiApiKeyEnc:  unifiApiKey  ? encrypt(unifiApiKey)  : null,
      unifiUserEnc:    unifiUser    ? encrypt(unifiUser)    : null,
      unifiPassEnc:    unifiPass    ? encrypt(unifiPass)    : null,
    })),
    skipDuplicates: true,
  });

  void writeAudit({ action: "CREATE", entity: "Device", entityName: `Bulk: ${name}`, details: { created: devices.count, ipStart, ipEnd, type: config.type } });
  return NextResponse.json({ created: devices.count, ips }, { status: 201 });
}
