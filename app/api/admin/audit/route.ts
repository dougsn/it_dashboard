export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/with-auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const unauth = await requireRole("ADMIN");
  if (unauth) return unauth;

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1", 10));
  const action = searchParams.get("action");
  const entity = searchParams.get("entity");
  const userId = searchParams.get("userId");
  const from   = searchParams.get("from");
  const to     = searchParams.get("to");

  const where: Prisma.AuditLogWhereInput = {};
  if (action) where.action = action as Prisma.EnumAuditActionFilter["equals"];
  if (entity) where.entity = entity;
  if (userId) where.userId = userId;
  if (from || to) {
    where.timestamp = {};
    if (from) {
      const d = new Date(from);
      if (isNaN(d.getTime())) return NextResponse.json({ error: "Parâmetro 'from' inválido" }, { status: 400 });
      where.timestamp.gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (isNaN(d.getTime())) return NextResponse.json({ error: "Parâmetro 'to' inválido" }, { status: 400 });
      where.timestamp.lte = d;
    }
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  });
}
