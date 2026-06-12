export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/with-auth";
import { db } from "@/lib/db";

export async function GET() {
  const unauth = await requireRole("ADMIN");
  if (unauth) return unauth;

  try {
    const [
      dbSizeResult,
      tableSizes,
      statusHistoryCount,
      linkEventCount,
      deviceCount,
      userCount,
      noteCount,
      linkCount,
      oldestHistory,
      newestHistory,
      heartbeat,
      config,
    ] = await Promise.all([
      db.$queryRaw`
        SELECT
          pg_size_pretty(pg_database_size(current_database())) AS size,
          pg_database_size(current_database()) AS size_bytes
      ` as Promise<[{ size: string; size_bytes: bigint }]>,
      db.$queryRaw`
        SELECT
          relname AS table_name,
          n_live_tup AS row_estimate,
          pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
          pg_total_relation_size(relid) AS total_bytes
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(relid) DESC
      ` as Promise<{ table_name: string; row_estimate: bigint; total_size: string; total_bytes: bigint }[]>,
      db.statusHistory.count(),
      db.linkEvent.count(),
      db.device.count(),
      db.user.count(),
      db.note.count(),
      db.link.count(),
      db.statusHistory.findFirst({ orderBy: { timestamp: "asc" }, select: { timestamp: true } }),
      db.statusHistory.findFirst({ orderBy: { timestamp: "desc" }, select: { timestamp: true } }),
      db.workerHeartbeat.findFirst(),
      db.systemConfig.findFirst(),
    ]);

    const dbSize = (dbSizeResult as [{ size: string; size_bytes: bigint }])[0];
    const tables = (tableSizes as { table_name: string; row_estimate: bigint; total_size: string; total_bytes: bigint }[]);

    const payload = {
      database: {
        size: String(dbSize.size),
        sizeBytes: Number(dbSize.size_bytes),
      },
      tables: tables.map((t) => ({
        name: String(t.table_name),
        rowEstimate: Number(t.row_estimate),
        totalSize: String(t.total_size),
        totalBytes: Number(t.total_bytes),
      })),
      counts: {
        statusHistory: statusHistoryCount,
        linkEvents: linkEventCount,
        devices: deviceCount,
        users: userCount,
        notes: noteCount,
        links: linkCount,
      },
      statusHistoryRange: {
        oldest: oldestHistory?.timestamp ?? null,
        newest: newestHistory?.timestamp ?? null,
      },
      worker: {
        lastSeenAt: heartbeat?.seenAt ?? null,
        isAlive: heartbeat
          ? Date.now() - new Date(heartbeat.seenAt).getTime() < 3 * 60 * 1000
          : false,
      },
      retention: {
        statusHistoryDays: config?.statusHistoryDays ?? 30,
        linkEventDays: config?.linkEventDays ?? 90,
        lastCleanupAt: config?.lastCleanupAt ?? null,
      },
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[admin/stats] erro:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
