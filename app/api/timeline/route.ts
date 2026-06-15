export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/with-auth";
import { getDeviceStatusEvents } from "@/lib/incident-detection";
import type { DeviceType } from "@prisma/client";

export type TimelineEventKind =
  | "DEVICE_OFFLINE"
  | "DEVICE_ONLINE"
  | "DEVICE_HIGH_LATENCY"
  | "LINK_DOWN"
  | "LINK_UP";

export interface TimelineEvent {
  id: string;
  kind: TimelineEventKind;
  entityId: string;
  entityName: string;
  entityType: DeviceType | "LINK";
  ip: string | null;
  location: string | null;
  timestamp: string;
  value?: number;
}

const LATENCY_THRESHOLD_MS = 150;

export async function GET(req: Request) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { searchParams } = new URL(req.url);
  const hours = Math.min(parseInt(searchParams.get("hours") ?? "") || 24, 168);
  const since = new Date(Date.now() - hours * 3_600_000);

  const events: TimelineEvent[] = [];

  // ── Device events ──────────────────────────────────────────────────────────
  // Fetch device metadata and the status transitions separately: the transitions
  // query (LAG window function) returns only the rows where the device's online
  // state OR its high-latency bucket changed — not the full history — keeping
  // memory bounded for the whole fleet.
  const [devices, statusEvents] = await Promise.all([
    db.device.findMany({ select: { id: true, name: true, ip: true, type: true, location: true } }),
    getDeviceStatusEvents(since, LATENCY_THRESHOLD_MS),
  ]);

  for (const device of devices) {
    const history = statusEvents.get(device.id);
    if (!history || history.length === 0) continue;

    let wasOffline = !history[0].isOnline;
    let wasHighLatency = false;

    for (let i = 1; i < history.length; i++) {
      const curr = history[i];
      const prev = history[i - 1];

      // Offline transition
      if (prev.isOnline && !curr.isOnline) {
        wasOffline = true;
        events.push({
          id: `${device.id}-offline-${curr.timestamp.getTime()}`,
          kind: "DEVICE_OFFLINE",
          entityId: device.id,
          entityName: device.name,
          entityType: device.type,
          ip: device.ip,
          location: device.location ?? null,
          timestamp: curr.timestamp.toISOString(),
        });
      }

      // Online recovery
      if (!prev.isOnline && curr.isOnline) {
        wasOffline = false;
        events.push({
          id: `${device.id}-online-${curr.timestamp.getTime()}`,
          kind: "DEVICE_ONLINE",
          entityId: device.id,
          entityName: device.name,
          entityType: device.type,
          ip: device.ip,
          location: device.location ?? null,
          timestamp: curr.timestamp.toISOString(),
        });
      }

      // High latency: only emit when it first exceeds threshold while online
      if (curr.isOnline && !wasOffline) {
        const highNow = (curr.pingMs ?? 0) > LATENCY_THRESHOLD_MS;
        if (highNow && !wasHighLatency) {
          events.push({
            id: `${device.id}-latency-${curr.timestamp.getTime()}`,
            kind: "DEVICE_HIGH_LATENCY",
            entityId: device.id,
            entityName: device.name,
            entityType: device.type,
            ip: device.ip,
            location: device.location ?? null,
            timestamp: curr.timestamp.toISOString(),
            value: curr.pingMs ?? undefined,
          });
        }
        wasHighLatency = highNow;
      }
    }
  }

  // ── Link events ────────────────────────────────────────────────────────────
  const links = await db.link.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      events: {
        where: { timestamp: { gte: since } },
        orderBy: { timestamp: "asc" },
        select: { id: true, type: true, timestamp: true },
      },
    },
  });

  for (const link of links) {
    for (const ev of link.events) {
      events.push({
        id: `link-${ev.id}`,
        kind: ev.type === "DOWN" ? "LINK_DOWN" : "LINK_UP",
        entityId: link.id,
        entityName: link.name,
        entityType: "LINK",
        ip: null,
        location: link.location ?? null,
        timestamp: ev.timestamp.toISOString(),
      });
    }
  }

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(events);
}
