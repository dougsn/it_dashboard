import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { deviceConfigSchema } from "@/lib/schemas/device";
import { encrypt } from "@/lib/crypto";
import { parseAndValidate } from "@/lib/parse-body";
import { sanitizeDevice } from "@/lib/device-utils";
import { notFoundOnP2025 } from "@/lib/prisma-error";

const updateSchema = deviceConfigSchema.partial();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
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
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  const body = await parseAndValidate(req, updateSchema);
  if (!body.ok) return body.response;

  const { routerosUser, routerosPass, unifiApiKey, unifiUser, unifiPass, omadaClientId, omadaClientSecret, ...rest } = body.data;

  const credentialUpdate: {
    routerosUserEnc?:     string | null;
    routerosPassEnc?:     string | null;
    unifiApiKeyEnc?:      string | null;
    unifiUserEnc?:        string | null;
    unifiPassEnc?:        string | null;
    omadaClientIdEnc?:    string | null;
    omadaClientSecretEnc?: string | null;
  } = {};
  if (routerosUser !== undefined) {
    credentialUpdate.routerosUserEnc = routerosUser ? encrypt(routerosUser) : null;
  }
  if (routerosPass !== undefined) {
    credentialUpdate.routerosPassEnc = routerosPass ? encrypt(routerosPass) : null;
  }
  if (unifiApiKey !== undefined) {
    credentialUpdate.unifiApiKeyEnc = unifiApiKey ? encrypt(unifiApiKey) : null;
  }
  if (unifiUser !== undefined) {
    credentialUpdate.unifiUserEnc = unifiUser ? encrypt(unifiUser) : null;
  }
  if (unifiPass !== undefined) {
    credentialUpdate.unifiPassEnc = unifiPass ? encrypt(unifiPass) : null;
  }
  if (omadaClientId !== undefined) {
    credentialUpdate.omadaClientIdEnc = omadaClientId ? encrypt(omadaClientId) : null;
  }
  if (omadaClientSecret !== undefined) {
    credentialUpdate.omadaClientSecretEnc = omadaClientSecret ? encrypt(omadaClientSecret) : null;
  }

  try {
    const device = await db.device.update({
      where: { id },
      data: { ...rest, ...credentialUpdate },
    });
    return NextResponse.json(sanitizeDevice(device));
  } catch (err) {
    return notFoundOnP2025(err) ?? (() => { throw err; })();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  try {
    await db.device.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return notFoundOnP2025(err) ?? (() => { throw err; })();
  }
}
