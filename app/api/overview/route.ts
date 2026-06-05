import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export type SegmentState = "online" | "offline" | "degraded" | "empty";

export interface OverviewData {
  sparklines: Record<string, (number | null)[]>;
  linkSegments: Record<string, SegmentState[]>;
}

export async function GET() {
  const now = Date.now();
  const since24h = new Date(now - 24 * 3_600_000);

  const since6h = new Date(now - 6 * 3_600_000);

  const [pingHistory, links, linkEvents] = await Promise.all([
    db.statusHistory.findMany({
      where: { timestamp: { gte: since6h } },
      orderBy: { timestamp: "asc" },
      select: { deviceId: true, pingMs: true, isOnline: true },
    }),
    db.link.findMany({ select: { id: true, isOnline: true } }),
    db.linkEvent.findMany({
      where: { timestamp: { gte: since24h } },
      orderBy: { timestamp: "asc" },
      select: { linkId: true, type: true, timestamp: true },
    }),
  ]);

  // Sparklines: last 60 checks per device (ping = null when offline)
  const sparklines: Record<string, (number | null)[]> = {};
  for (const r of pingHistory) {
    if (!sparklines[r.deviceId]) sparklines[r.deviceId] = [];
    sparklines[r.deviceId].push(r.isOnline ? (r.pingMs ?? null) : null);
  }
  for (const id of Object.keys(sparklines)) {
    sparklines[id] = sparklines[id].slice(-60);
  }

  // Link segments: 24 hourly slots
  const linkSegments: Record<string, SegmentState[]> = {};
  for (const link of links) {
    const events = linkEvents.filter((e) => e.linkId === link.id);

    const segments: SegmentState[] = Array.from({ length: 24 }, (_, i) => {
      const segStart = now - (24 - i) * 3_600_000;
      const segEnd = segStart + 3_600_000;
      const inSeg = events.filter((e) => {
        const t = new Date(e.timestamp).getTime();
        return t >= segStart && t < segEnd;
      });

      if (inSeg.length === 0) {
        // Use last known state before this segment
        const before = events.filter((e) => new Date(e.timestamp).getTime() < segStart);
        if (before.length === 0) return "empty";
        return before[before.length - 1].type === "UP" ? "online" : "offline";
      }

      const hasDown = inSeg.some((e) => e.type === "DOWN");
      const last = inSeg[inSeg.length - 1];
      if (!hasDown) return "online";
      if (last.type === "UP") return "degraded";
      return "offline";
    });

    linkSegments[link.id] = segments;
  }

  return NextResponse.json({ sparklines, linkSegments } satisfies OverviewData);
}
