import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type SegmentState = "online" | "offline" | "degraded" | "empty";

export interface OverviewData {
  sparklines: Record<string, (number | null)[]>;
  linkSegments: Record<string, SegmentState[]>;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = Date.now();
  const since24h = new Date(now - 24 * 3_600_000);
  const since6h  = new Date(now - 6  * 3_600_000);

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

  // Pre-group events by linkId — O(events) once, avoids repeated .filter() inside the segment loop
  const eventsByLink = new Map<string, typeof linkEvents>();
  for (const event of linkEvents) {
    let arr = eventsByLink.get(event.linkId);
    if (!arr) { arr = []; eventsByLink.set(event.linkId, arr); }
    arr.push(event);
  }

  // Link segments: 24 hourly slots
  // Linear scan per link — O(events_per_link + 24) instead of O(24 × events_per_link)
  const linkSegments: Record<string, SegmentState[]> = {};

  for (const link of links) {
    const events = eventsByLink.get(link.id) ?? [];
    const segments: SegmentState[] = [];
    let eventIdx = 0;
    // Initial state: use current link state as fallback when no events precede the window
    let stateBeforeSeg: "online" | "offline" = link.isOnline ? "online" : "offline";

    for (let i = 0; i < 24; i++) {
      const segStart = now - (24 - i) * 3_600_000;
      const segEnd   = segStart + 3_600_000;

      let hasDown = false;
      let lastInSeg: (typeof events)[0] | null = null;
      let countInSeg = 0;

      // Advance pointer through events that belong to this segment [segStart, segEnd)
      while (eventIdx < events.length && events[eventIdx].timestamp.getTime() < segEnd) {
        hasDown = hasDown || events[eventIdx].type === "DOWN";
        lastInSeg = events[eventIdx];
        countInSeg++;
        eventIdx++;
      }

      let state: SegmentState;
      if (countInSeg === 0) {
        state = stateBeforeSeg;
      } else if (!hasDown) {
        state = "online";
      } else if (lastInSeg!.type === "UP") {
        state = "degraded";
      } else {
        state = "offline";
      }

      if (lastInSeg) {
        stateBeforeSeg = lastInSeg.type === "UP" ? "online" : "offline";
      }

      segments.push(state);
    }

    linkSegments[link.id] = segments;
  }

  return NextResponse.json({ sparklines, linkSegments } satisfies OverviewData);
}
