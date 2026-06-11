import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import type { DeviceType } from "@prisma/client";

export interface Incident {
  id: string;
  deviceId: string;
  deviceName: string;
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

  const devices = await db.device.findMany({
    include: {
      currentStatus: true,
      history: {
        where: { timestamp: { gte: since } },
        orderBy: { timestamp: "asc" },
        select: { isOnline: true, timestamp: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const incidents: Incident[] = [];

  for (const device of devices) {
    const history = device.history;
    if (history.length === 0) continue;

    let incidentStart: Date | null = null;

    // If first record is already offline, incident started before the window
    if (!history[0].isOnline) {
      incidentStart = since;
    }

    for (let i = 1; i < history.length; i++) {
      const curr = history[i];
      const prev = history[i - 1];

      if (prev.isOnline && !curr.isOnline) {
        incidentStart = curr.timestamp;
      }

      if (!prev.isOnline && curr.isOnline && incidentStart) {
        incidents.push({
          id: `${device.id}-${incidentStart.getTime()}`,
          deviceId: device.id,
          deviceName: device.name,
          deviceType: device.type,
          startAt: incidentStart.toISOString(),
          endAt: curr.timestamp.toISOString(),
          durationMs: curr.timestamp.getTime() - incidentStart.getTime(),
          resolved: true,
        });
        incidentStart = null;
      }
    }

    // Open incident: last known state is offline
    const lastRecord = history[history.length - 1];
    if (incidentStart && !lastRecord.isOnline) {
      incidents.push({
        id: `${device.id}-${incidentStart.getTime()}-open`,
        deviceId: device.id,
        deviceName: device.name,
        deviceType: device.type,
        startAt: incidentStart.toISOString(),
        endAt: null,
        durationMs: Date.now() - incidentStart.getTime(),
        resolved: false,
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
