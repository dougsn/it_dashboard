import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const deviceSchema = z.object({
  name: z.string().min(1),
  ip: z.string().min(1),
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

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const devices = await db.device.findMany({
    where: type ? { type: type as "MIKROTIK" | "DVR" | "CAMERA" | "OTHER" } : undefined,
    include: { currentStatus: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(devices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = deviceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const device = await db.device.create({ data: parsed.data });

  return NextResponse.json(device, { status: 201 });
}
