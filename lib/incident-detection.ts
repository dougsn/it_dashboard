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
