import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const bulkSchema = z.object({
  name: z.string().min(1),
  ipStart: z.string().min(1),
  ipEnd: z.string().min(1),
  type: z.enum(["MIKROTIK", "DVR", "CAMERA", "OTHER"]),
  location: z.string().optional(),
  notes: z.string().optional(),
  pingEnabled: z.boolean().default(true),
  httpEnabled: z.boolean().default(false),
  httpPort: z.number().optional().nullable(),
  httpPath: z.string().default("/"),
  snmpEnabled: z.boolean().default(false),
  snmpCommunity: z.string().default("public"),
  snmpPort: z.number().default(161),
  routerosEnabled: z.boolean().default(false),
  routerosUser: z.string().optional().nullable(),
  routerosPass: z.string().optional().nullable(),
  routerosPort: z.number().default(8728),
  checkInterval: z.number().default(60),
});

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

  const body = await req.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ipStart, ipEnd, name, ...config } = parsed.data;

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
    data: ips.map((ip) => ({ ...config, name, ip })),
    skipDuplicates: true,
  });

  return NextResponse.json({ created: devices.count, ips }, { status: 201 });
}
