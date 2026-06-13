export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { deviceConfigSchema } from "@/lib/schemas/device";
import { encrypt } from "@/lib/crypto";
import { parseAndValidate } from "@/lib/parse-body";
import { sanitizeDevice } from "@/lib/device-utils";
import { writeAudit } from "@/lib/audit";
import { createHash } from "crypto";

const deviceTypeSchema = z.enum(["MIKROTIK", "DVR", "CAMERA", "OTHER", "UNIFI_AP", "OMADA_AP"]);

export async function GET(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { searchParams } = new URL(req.url);
  const rawType  = searchParams.get("type");
  const rawPage  = searchParams.get("page");
  const rawLimit = searchParams.get("limit");

  if (rawType !== null) {
    const parsed = deviceTypeSchema.safeParse(rawType);
    if (!parsed.success) {
      return NextResponse.json({ error: "Tipo de dispositivo inválido" }, { status: 400 });
    }
  }

  const where = rawType ? { type: rawType as "MIKROTIK" | "DVR" | "CAMERA" | "OTHER" } : undefined;
  const paginate = rawPage !== null || rawLimit !== null;
  const limit = Math.min(Math.max(parseInt(rawLimit ?? "50", 10) || 50, 1), 200);
  const page  = Math.max(parseInt(rawPage  ?? "1",  10) || 1, 1);

  if (paginate) {
    const [devices, total] = await Promise.all([
      db.device.findMany({ where, include: { currentStatus: true }, orderBy: { name: "asc" }, skip: (page - 1) * limit, take: limit }),
      db.device.count({ where }),
    ]);
    return NextResponse.json(devices.map(sanitizeDevice), { headers: { "X-Total-Count": String(total) } });
  }

  // ETag: cheap aggregate instead of full fetch — only on unfiltered, non-paginated list
  if (!rawType) {
    const agg = await db.device.aggregate({ _count: true, _max: { updatedAt: true } });
    const fingerprint = `${agg._count}:${agg._max.updatedAt?.toISOString() ?? ""}`;
    const etag = `"${createHash("md5").update(fingerprint).digest("hex")}"`;
    if (req.headers.get("if-none-match") === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } });
    }
    const devices = await db.device.findMany({
      where,
      include: { currentStatus: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(devices.map(sanitizeDevice), { headers: { ETag: etag } });
  }

  const devices = await db.device.findMany({
    where,
    include: { currentStatus: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(devices.map(sanitizeDevice));
}

export async function POST(req: NextRequest) {
  const unauth = await requireRole("OPERADOR");
  if (unauth) return unauth;
  const body = await parseAndValidate(req, deviceConfigSchema);
  if (!body.ok) return body.response;

  const { routerosUser, routerosPass, unifiApiKey, unifiUser, unifiPass, omadaClientId, omadaClientSecret, snmpCommunity, ...rest } = body.data;

  const device = await db.device.create({
    data: {
      ...rest,
      snmpCommunityEnc:    snmpCommunity    ? encrypt(snmpCommunity)    : null,
      routerosUserEnc:     routerosUser     ? encrypt(routerosUser)     : null,
      routerosPassEnc:     routerosPass     ? encrypt(routerosPass)     : null,
      unifiApiKeyEnc:      unifiApiKey      ? encrypt(unifiApiKey)      : null,
      unifiUserEnc:        unifiUser        ? encrypt(unifiUser)        : null,
      unifiPassEnc:        unifiPass        ? encrypt(unifiPass)        : null,
      omadaClientIdEnc:    omadaClientId    ? encrypt(omadaClientId)    : null,
      omadaClientSecretEnc: omadaClientSecret ? encrypt(omadaClientSecret) : null,
    },
  });

  void writeAudit({ action: "CREATE", entity: "Device", entityId: device.id, entityName: device.name, details: { ip: device.ip, type: device.type, location: device.location } });
  return NextResponse.json(sanitizeDevice(device), { status: 201 });
}
