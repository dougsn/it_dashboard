import { db } from "@/lib/db";
import type { PrismaClient } from "@prisma/client";

export interface DeviceReportStats {
  total: number;
  online: number;
  avgPing: number | null;
  minPing: number | null;
  maxPing: number | null;
  avgCpu: number | null;
  cpuCount: number;
  highCpu: number;
  avgMem: number | null;
  memCount: number;
}

export interface ChartSampleRow {
  isOnline: boolean;
  pingMs: number | null;
  cpuLoad: number | null;
  memoryUsed: number | null;
  timestamp: Date;
}

/**
 * Computes all report statistics in a single pass on the database using FILTER
 * aggregates — no rows are shipped to the app. Replaces loading the full history
 * into memory just to reduce it to counts and averages.
 */
export async function getDeviceReportStats(
  deviceId: string,
  since: Date,
  highCpuThreshold = 80,
  client: Pick<PrismaClient, "$queryRaw"> = db,
): Promise<DeviceReportStats> {
  const [row] = await client.$queryRaw<Array<Record<string, number | null>>>`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE "isOnline")::int AS online,
      AVG("pingMs") FILTER (WHERE "isOnline" AND "pingMs" IS NOT NULL)::float8 AS avg_ping,
      MIN("pingMs") FILTER (WHERE "isOnline" AND "pingMs" IS NOT NULL)::int AS min_ping,
      MAX("pingMs") FILTER (WHERE "isOnline" AND "pingMs" IS NOT NULL)::int AS max_ping,
      AVG("cpuLoad") FILTER (WHERE "cpuLoad" IS NOT NULL)::float8 AS avg_cpu,
      COUNT(*) FILTER (WHERE "cpuLoad" IS NOT NULL)::int AS cpu_count,
      COUNT(*) FILTER (WHERE "cpuLoad" > ${highCpuThreshold})::int AS high_cpu,
      AVG("memoryUsed") FILTER (WHERE "memoryUsed" IS NOT NULL)::float8 AS avg_mem,
      COUNT(*) FILTER (WHERE "memoryUsed" IS NOT NULL)::int AS mem_count
    FROM "StatusHistory"
    WHERE "deviceId" = ${deviceId} AND "timestamp" >= ${since}
  `;

  return {
    total: Number(row?.total ?? 0),
    online: Number(row?.online ?? 0),
    avgPing: row?.avg_ping ?? null,
    minPing: row?.min_ping ?? null,
    maxPing: row?.max_ping ?? null,
    avgCpu: row?.avg_cpu ?? null,
    cpuCount: Number(row?.cpu_count ?? 0),
    highCpu: Number(row?.high_cpu ?? 0),
    avgMem: row?.avg_mem ?? null,
    memCount: Number(row?.mem_count ?? 0),
  };
}

/**
 * Returns at most `maxPoints` evenly-strided samples for the charts, computed in
 * the database (the modulo stride matches the old JS downsample's "pick every Nth
 * sample" — visually identical, but without loading every row into memory).
 */
export async function getDeviceChartSamples(
  deviceId: string,
  since: Date,
  maxPoints = 400,
  client: Pick<PrismaClient, "$queryRaw"> = db,
): Promise<ChartSampleRow[]> {
  return client.$queryRaw<ChartSampleRow[]>`
    WITH numbered AS (
      SELECT
        "isOnline", "pingMs", "cpuLoad", "memoryUsed", "timestamp",
        ROW_NUMBER() OVER (ORDER BY "timestamp") - 1 AS idx,
        COUNT(*) OVER () AS total
      FROM "StatusHistory"
      WHERE "deviceId" = ${deviceId} AND "timestamp" >= ${since}
    )
    SELECT "isOnline", "pingMs", "cpuLoad", "memoryUsed", "timestamp"
    FROM numbered
    WHERE total <= ${maxPoints}
       OR (idx % ((total + ${maxPoints} - 1) / ${maxPoints}) = 0)
    ORDER BY "timestamp"
  `;
}
