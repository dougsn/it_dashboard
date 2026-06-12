export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/with-auth";

export interface HealthData {
  totalChecks: number;
  onlineChecks: number;
  uptimePct: number;
  workerLastSeen: string | null;
  workerStatus: "ok" | "stale" | "unknown";
}

export async function GET() {
  // SEC-024: rota protegida — expõe métricas operacionais internas
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const since = new Date(Date.now() - 24 * 3_600_000);

  const [totalChecks, onlineChecks, heartbeat] = await Promise.all([
    db.statusHistory.count({ where: { timestamp: { gte: since } } }),
    db.statusHistory.count({ where: { timestamp: { gte: since }, isOnline: true } }),
    db.workerHeartbeat.findUnique({ where: { id: 1 } }),
  ]);

  const uptimePct = totalChecks > 0 ? (onlineChecks / totalChecks) * 100 : 100;

  // Worker is considered stale if no heartbeat in the last 3 minutes
  let workerStatus: "ok" | "stale" | "unknown" = "unknown";
  if (heartbeat) {
    const ageMs = Date.now() - heartbeat.seenAt.getTime();
    workerStatus = ageMs < 3 * 60_000 ? "ok" : "stale";
  }

  return NextResponse.json({
    totalChecks,
    onlineChecks,
    uptimePct,
    workerLastSeen: heartbeat?.seenAt.toISOString() ?? null,
    workerStatus,
  });
}
