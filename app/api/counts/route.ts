export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";

// Lightweight counts for the sidebar badges. Uses count() queries (no row payload)
// so the sidebar can poll for live offline/online numbers without refetching lists.
export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const [devicesTotal, devicesOnline, linksTotal, linksOnline] = await Promise.all([
    db.device.count(),
    db.device.count({ where: { currentStatus: { isOnline: true } } }),
    db.link.count(),
    db.link.count({ where: { isOnline: true } }),
  ]);

  // A device with no status row yet counts as offline (matches the dashboard layout).
  return NextResponse.json({
    devicesTotal,
    devicesOffline: devicesTotal - devicesOnline,
    linksOnline,
    linksTotal,
  });
}
