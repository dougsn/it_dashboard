export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";

// In-process cache (15s TTL). Assumes single-instance deployment — same premise as
// the in-memory login rate limiter (SEC-014). In a multi-process/serverless setup
// each instance would keep its own cache; move to Redis/unstable_cache if scaling out.
const CACHE_TTL_MS = 15_000;
let cache: { data: OverviewData; expiresAt: number } | null = null;

export function resetOverviewCache() { cache = null; }

export type SegmentState = "online" | "offline" | "degraded" | "empty";

export interface OverviewData {
  sparklines: Record<string, (number | null)[]>;
  linkSegments: Record<string, SegmentState[]>;
}

export async function GET(_req: Request) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const now = Date.now();

  if (cache && now < cache.expiresAt) {
    return NextResponse.json(cache.data);
  }
  const since24h = new Date(now - 24 * 3_600_000);
  const since6h  = new Date(now - 6  * 3_600_000);

  const [pingHistory, links, linkEvents, lastEventsBefore] = await Promise.all([
    // Sparklines only need the last 60 samples per device — fetch exactly those
    // (windowed) instead of pulling 6h of history for every device and slicing in JS.
    db.$queryRaw<{ deviceId: string; pingMs: number | null; isOnline: boolean }[]>`
      SELECT "deviceId", "pingMs", "isOnline"
      FROM (
        SELECT "deviceId", "pingMs", "isOnline", "timestamp",
          ROW_NUMBER() OVER (PARTITION BY "deviceId" ORDER BY "timestamp" DESC) AS rn
        FROM "StatusHistory"
        WHERE "timestamp" >= ${since6h}
      ) ranked
      WHERE rn <= 60
      ORDER BY "deviceId", "timestamp" ASC
    `,
    db.link.findMany({ select: { id: true, isOnline: true } }),
    db.linkEvent.findMany({
      where: { timestamp: { gte: since24h } },
      orderBy: { timestamp: "asc" },
      select: { linkId: true, type: true, timestamp: true },
    }),
    // Last event before the window per link — determines true initial state for each bar
    db.linkEvent.findMany({
      where: { timestamp: { lt: since24h } },
      orderBy: { timestamp: "desc" },
      distinct: ["linkId"],
      select: { linkId: true, type: true },
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

  // True state of each link just before the 24h window (based on last recorded event)
  const stateBeforeWindow = new Map(
    lastEventsBefore.map((e) => [e.linkId, e.type === "UP" ? "online" as const : "offline" as const])
  );

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
    // Use last pre-window event to determine true historical initial state.
    // Fall back to current isOnline only when no events exist at all (link never changed state).
    let stateBeforeSeg: "online" | "offline" =
      stateBeforeWindow.get(link.id) ?? (link.isOnline ? "online" : "offline");

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

  const payload: OverviewData = { sparklines, linkSegments };
  cache = { data: payload, expiresAt: now + CACHE_TTL_MS };
  return NextResponse.json(payload);
}
