export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/with-auth";
import { db } from "@/lib/db";

export async function POST() {
  const unauth = await requireRole("ADMIN");
  if (unauth) return unauth;

  const config = await db.systemConfig.upsert({
    where: { id: 1 },
    create: { id: 1, statusHistoryDays: 30, linkEventDays: 90 },
    update: {},
  });

  const historyBefore = new Date(Date.now() - config.statusHistoryDays * 24 * 60 * 60 * 1000);
  const eventsBefore = new Date(Date.now() - config.linkEventDays * 24 * 60 * 60 * 1000);

  const [deletedHistory, deletedEvents] = await Promise.all([
    db.statusHistory.deleteMany({ where: { timestamp: { lt: historyBefore } } }),
    db.linkEvent.deleteMany({ where: { timestamp: { lt: eventsBefore } } }),
  ]);

  await db.systemConfig.update({
    where: { id: 1 },
    data: { lastCleanupAt: new Date() },
  });

  return NextResponse.json({
    deletedStatusHistory: deletedHistory.count,
    deletedLinkEvents: deletedEvents.count,
    cutoffs: {
      statusHistory: historyBefore.toISOString(),
      linkEvents: eventsBefore.toISOString(),
    },
  });
}
