export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/with-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const CSV_HEADERS = ["id", "timestamp", "username", "ipAddress", "action", "entity", "entityName", "entityId", "details"];

function csvEscape(value: unknown): string {
  if (value == null) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  // Prevent spreadsheet formula injection (OWASP CSV injection)
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  if (safe !== str || safe.includes('"') || safe.includes(",") || safe.includes("\n")) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export async function GET(req: NextRequest) {
  const unauth = await requireRole("ADMIN");
  if (unauth) return unauth;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const entity = searchParams.get("entity");
  const from   = searchParams.get("from");
  const to     = searchParams.get("to");

  const where: Prisma.AuditLogWhereInput = {};
  if (action) where.action = action as Prisma.EnumAuditActionFilter["equals"];
  if (entity) where.entity = entity;
  if (from || to) {
    where.timestamp = {};
    if (from) where.timestamp.gte = new Date(from);
    if (to)   where.timestamp.lte = new Date(to);
  }

  const logs = await db.auditLog.findMany({
    where,
    orderBy: { timestamp: "desc" },
    take: 10_000,
  });

  const rows = [
    CSV_HEADERS.join(","),
    ...logs.map((l) => [
      l.id,
      l.timestamp.toISOString(),
      l.username,
      l.ipAddress,
      l.action,
      l.entity,
      l.entityName,
      l.entityId,
      l.details,
    ].map(csvEscape).join(",")),
  ].join("\r\n");

  const filename = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
