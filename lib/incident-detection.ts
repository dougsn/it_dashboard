import { db } from "@/lib/db";
import type { PrismaClient } from "@prisma/client";

export interface TransitionRow {
  deviceId: string;
  isOnline: boolean;
  timestamp: Date;
}

export interface DetectedIncident {
  startAt: string;
  endAt: string | null;
  durationMs: number | null;
  resolved: boolean;
}

/**
 * Returns, per device, only the StatusHistory rows where `isOnline` changed
 * (plus the first and last row in the window). This is the minimal set needed to
 * reconstruct incidents without loading the entire history into memory — a 30-day
 * window for 100 devices is millions of rows, but only a handful are transitions.
 *
 * Running incident detection over this reduced sequence is provably identical to
 * running it over the full history: incidents depend only on transition timestamps
 * and the window boundaries, and non-transition rows are no-ops in the detection loop.
 */
export async function getOnlineTransitions(
  since: Date,
  client: Pick<PrismaClient, "$queryRaw"> = db,
): Promise<Map<string, TransitionRow[]>> {
  const rows = await client.$queryRaw<TransitionRow[]>`
    WITH ranked AS (
      SELECT
        "deviceId",
        "isOnline",
        "timestamp",
        LAG("isOnline") OVER w AS prev_online,
        ROW_NUMBER() OVER w AS rn,
        ROW_NUMBER() OVER (PARTITION BY "deviceId" ORDER BY "timestamp" DESC) AS rn_desc
      FROM "StatusHistory"
      WHERE "timestamp" >= ${since}
      WINDOW w AS (PARTITION BY "deviceId" ORDER BY "timestamp")
    )
    SELECT "deviceId", "isOnline", "timestamp"
    FROM ranked
    WHERE rn = 1 OR rn_desc = 1 OR "isOnline" IS DISTINCT FROM prev_online
    ORDER BY "deviceId", "timestamp"
  `;

  const byDevice = new Map<string, TransitionRow[]>();
  for (const row of rows) {
    const list = byDevice.get(row.deviceId);
    if (list) list.push(row);
    else byDevice.set(row.deviceId, [row]);
  }
  return byDevice;
}

/**
 * Same as getOnlineTransitions but scoped to a single device — used by the
 * per-device report builder so it doesn't scan the whole fleet's history.
 */
export async function getOnlineTransitionsForDevice(
  deviceId: string,
  since: Date,
  client: Pick<PrismaClient, "$queryRaw"> = db,
): Promise<TransitionRow[]> {
  return client.$queryRaw<TransitionRow[]>`
    WITH ranked AS (
      SELECT
        "deviceId",
        "isOnline",
        "timestamp",
        LAG("isOnline") OVER w AS prev_online,
        ROW_NUMBER() OVER w AS rn,
        ROW_NUMBER() OVER (ORDER BY "timestamp" DESC) AS rn_desc
      FROM "StatusHistory"
      WHERE "deviceId" = ${deviceId} AND "timestamp" >= ${since}
      WINDOW w AS (ORDER BY "timestamp")
    )
    SELECT "deviceId", "isOnline", "timestamp"
    FROM ranked
    WHERE rn = 1 OR rn_desc = 1 OR "isOnline" IS DISTINCT FROM prev_online
    ORDER BY "timestamp"
  `;
}

export interface StatusEventRow {
  deviceId: string;
  isOnline: boolean;
  pingMs: number | null;
  timestamp: Date;
}

/**
 * Like getOnlineTransitions, but also returns the rows where the high-latency
 * bucket `(isOnline AND pingMs > threshold)` changed, and keeps pingMs — the
 * minimal set needed to reconstruct the timeline's online/offline AND high-latency
 * events without loading the full history.
 *
 * Note: unlike the previous in-memory version, an event is only emitted on a real
 * rising edge of the latency bucket. The old code had an artifact where a device
 * already slow at the window start emitted a spurious high-latency event on its
 * second sample; that artifact is intentionally not reproduced.
 */
export async function getDeviceStatusEvents(
  since: Date,
  latencyThresholdMs = 150,
  client: Pick<PrismaClient, "$queryRaw"> = db,
): Promise<Map<string, StatusEventRow[]>> {
  const rows = await client.$queryRaw<StatusEventRow[]>`
    WITH ranked AS (
      SELECT
        "deviceId",
        "isOnline",
        "pingMs",
        "timestamp",
        LAG("isOnline") OVER w AS prev_online,
        LAG("isOnline" AND COALESCE("pingMs", 0) > ${latencyThresholdMs}) OVER w AS prev_high,
        ROW_NUMBER() OVER w AS rn
      FROM "StatusHistory"
      WHERE "timestamp" >= ${since}
      WINDOW w AS (PARTITION BY "deviceId" ORDER BY "timestamp")
    )
    SELECT "deviceId", "isOnline", "pingMs", "timestamp"
    FROM ranked
    WHERE rn = 1
       OR "isOnline" IS DISTINCT FROM prev_online
       OR ("isOnline" AND COALESCE("pingMs", 0) > ${latencyThresholdMs}) IS DISTINCT FROM prev_high
    ORDER BY "deviceId", "timestamp"
  `;

  const byDevice = new Map<string, StatusEventRow[]>();
  for (const row of rows) {
    const list = byDevice.get(row.deviceId);
    if (list) list.push(row);
    else byDevice.set(row.deviceId, [row]);
  }
  return byDevice;
}

/**
 * Reconstructs incidents from an ascending sequence of status rows. The first row
 * being offline counts as an incident already in progress at the window boundary
 * (`since`). A trailing offline state yields an open (unresolved) incident.
 */
export function detectIncidents(
  history: { isOnline: boolean; timestamp: Date }[],
  since: Date,
): DetectedIncident[] {
  const incidents: DetectedIncident[] = [];
  if (history.length === 0) return incidents;

  let incidentStart: Date | null = null;
  if (!history[0].isOnline) incidentStart = since;

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    if (prev.isOnline && !curr.isOnline) incidentStart = curr.timestamp;
    if (!prev.isOnline && curr.isOnline && incidentStart) {
      incidents.push({
        startAt: incidentStart.toISOString(),
        endAt: curr.timestamp.toISOString(),
        durationMs: curr.timestamp.getTime() - incidentStart.getTime(),
        resolved: true,
      });
      incidentStart = null;
    }
  }

  const last = history[history.length - 1];
  if (incidentStart && !last.isOnline) {
    incidents.push({
      startAt: incidentStart.toISOString(),
      endAt: null,
      durationMs: Date.now() - incidentStart.getTime(),
      resolved: false,
    });
  }

  return incidents;
}
