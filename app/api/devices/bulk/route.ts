import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bulkDeviceSchema } from "@/lib/schemas/device";
import { encrypt } from "@/lib/crypto";
import { parseBody } from "@/lib/parse-body";

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
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await parseBody(req);
  if (!raw.ok) return raw.response;
  const parsed = bulkDeviceSchema.safeParse(raw.data);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ipStart, ipEnd, name, routerosUser, routerosPass, ...config } = parsed.data;

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
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ created: devices.count, ips }, { status: 201 });
}
