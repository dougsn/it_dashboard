import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deviceConfigSchema } from "@/lib/schemas/device";
import { encrypt, resolveRouterosCredentials } from "@/lib/crypto";
import { Prisma } from "@prisma/client";
import { parseBody } from "@/lib/parse-body";
import type { Device } from "@prisma/client";

const updateSchema = deviceConfigSchema.partial();

function sanitizeDevice(device: Device) {
  const { routerosUser, routerosPass, routerosUserEnc, routerosPassEnc, ...rest } = device;
  return {
    ...rest,
    hasRouterosCredentials: !!(resolveRouterosCredentials({ routerosUser, routerosPass, routerosUserEnc, routerosPassEnc })),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const device = await db.device.findUnique({
    where: { id },
    include: { currentStatus: true },
  });

  if (!device) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(sanitizeDevice(device));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const raw = await parseBody(req);
  if (!raw.ok) return raw.response;
  const parsed = updateSchema.safeParse(raw.data);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { routerosUser, routerosPass, ...rest } = parsed.data;

  // Only update credentials if new non-empty values are provided
  const credentialUpdate: { routerosUserEnc?: string | null; routerosPassEnc?: string | null } = {};
  if (routerosUser !== undefined) {
    credentialUpdate.routerosUserEnc = routerosUser ? encrypt(routerosUser) : null;
  }
  if (routerosPass !== undefined) {
    credentialUpdate.routerosPassEnc = routerosPass ? encrypt(routerosPass) : null;
  }

  try {
    const device = await db.device.update({
      where: { id },
      data: { ...rest, ...credentialUpdate },
    });
    return NextResponse.json(sanitizeDevice(device));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.device.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}
