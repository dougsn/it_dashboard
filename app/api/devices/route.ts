import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { deviceConfigSchema } from "@/lib/schemas/device";
import { encrypt, resolveRouterosCredentials } from "@/lib/crypto";
import { parseBody } from "@/lib/parse-body";
import type { Device } from "@prisma/client";

const deviceTypeSchema = z.enum(["MIKROTIK", "DVR", "CAMERA", "OTHER"]);

function sanitizeDevice(device: Device) {
  const { routerosUser, routerosPass, routerosUserEnc, routerosPassEnc, ...rest } = device;
  return {
    ...rest,
    hasRouterosCredentials: !!(resolveRouterosCredentials({ routerosUser, routerosPass, routerosUserEnc, routerosPassEnc })),
  };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rawType = searchParams.get("type");

  if (rawType !== null) {
    const parsed = deviceTypeSchema.safeParse(rawType);
    if (!parsed.success) {
      return NextResponse.json({ error: "Tipo de dispositivo inválido" }, { status: 400 });
    }
  }

  const devices = await db.device.findMany({
    where: rawType ? { type: rawType as "MIKROTIK" | "DVR" | "CAMERA" | "OTHER" } : undefined,
    include: { currentStatus: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(devices.map(sanitizeDevice));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await parseBody(req);
  if (!raw.ok) return raw.response;
  const parsed = deviceConfigSchema.safeParse(raw.data);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { routerosUser, routerosPass, ...rest } = parsed.data;

  const device = await db.device.create({
    data: {
      ...rest,
      routerosUserEnc: routerosUser ? encrypt(routerosUser) : null,
      routerosPassEnc: routerosPass ? encrypt(routerosPass) : null,
    },
  });

  return NextResponse.json(sanitizeDevice(device), { status: 201 });
}
