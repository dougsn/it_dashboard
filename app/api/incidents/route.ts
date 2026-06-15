export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { getOnlineTransitions, detectIncidents } from "@/lib/incident-detection";
import type { DeviceType } from "@prisma/client";

export interface Incident {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceIp: string;
  deviceType: DeviceType;
  startAt: string;
  endAt: string | null;
  durationMs: number | null;
  resolved: boolean;
}

export interface PaginatedIncidentsResponse {
  data: Incident[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function GET(req: Request) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { searchParams } = new URL(req.url);
  const hours = Math.min(parseInt(searchParams.get("hours") ?? "") || 168, 720);
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "") || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "") || 25));
  const since = new Date(Date.now() - hours * 3_600_000);

  // Fetch device metadata and the status transitions separately: the transitions
  // query returns only the rows where isOnline changed (not the full history),
  // keeping memory bounded even for 30-day windows over a large fleet.
  const [devices, transitions] = await Promise.all([
    db.device.findMany({ select: { id: true, name: true, ip: true, type: true }, orderBy: { name: "asc" } }),
    getOnlineTransitions(since),
  ]);

  const incidents: Incident[] = [];

  for (const device of devices) {
    const history = transitions.get(device.id);
    if (!history || history.length === 0) continue;

    for (const inc of detectIncidents(history, since)) {
      const startMs = new Date(inc.startAt).getTime();
      incidents.push({
        id: inc.resolved ? `${device.id}-${startMs}` : `${device.id}-${startMs}-open`,
        deviceId: device.id,
        deviceName: device.name,
        deviceIp: device.ip,
        deviceType: device.type,
        startAt: inc.startAt,
        endAt: inc.endAt,
        durationMs: inc.durationMs,
        resolved: inc.resolved,
      });
    }
  }

  incidents.sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
  );

  const total = incidents.length;
  const start = (page - 1) * limit;

  return NextResponse.json({
    data: incidents.slice(start, start + limit),
    total,
    page,
    limit,
    hasMore: start + limit < total,
  } satisfies PaginatedIncidentsResponse);
}
