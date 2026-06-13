import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireRole } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { parseAndValidate } from "@/lib/parse-body";
import { writeAudit } from "@/lib/audit";

const noteSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(200),
  content: z.string().min(1, "Conteúdo obrigatório").max(10_000),
  severity: z.enum(["INFO", "WARNING", "HIGH", "CRITICAL"]).default("INFO"),
  category: z.enum(["SECURITY", "OPERATIONAL", "GENERAL"]).default("GENERAL"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).default("OPEN"),
  deviceId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { searchParams } = new URL(req.url);
  const rawPage     = searchParams.get("page");
  const rawLimit    = searchParams.get("limit");
  const rawSeverity = searchParams.get("severity");
  const rawStatus   = searchParams.get("status");

  const severitySchema = z.enum(["INFO", "WARNING", "HIGH", "CRITICAL"]);
  const statusSchema   = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]);

  const severityFilter = rawSeverity ? severitySchema.safeParse(rawSeverity) : null;
  if (severityFilter && !severityFilter.success) {
    return NextResponse.json({ error: "Severity inválido" }, { status: 400 });
  }
  const statusFilter = rawStatus ? statusSchema.safeParse(rawStatus) : null;
  if (statusFilter && !statusFilter.success) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const where = {
    ...(severityFilter?.success ? { severity: severityFilter.data } : {}),
    ...(statusFilter?.success   ? { status:   statusFilter.data   } : {}),
  };
  const orderBy = [{ severity: "desc" as const }, { createdAt: "desc" as const }];
  const include = { device: { select: { id: true, name: true, ip: true } } };

  const paginate = rawPage !== null || rawLimit !== null;
  const limit = Math.min(Math.max(parseInt(rawLimit ?? "50", 10) || 50, 1), 200);
  const page  = Math.max(parseInt(rawPage  ?? "1",  10) || 1, 1);

  if (paginate) {
    const [notes, total] = await Promise.all([
      db.note.findMany({ where, include, orderBy, skip: (page - 1) * limit, take: limit }),
      db.note.count({ where }),
    ]);
    return NextResponse.json(notes, { headers: { "X-Total-Count": String(total) } });
  }

  const notes = await db.note.findMany({ where, include, orderBy });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const unauth = await requireRole("OPERADOR");
  if (unauth) return unauth;
  const body = await parseAndValidate(req, noteSchema);
  if (!body.ok) return body.response;

  const note = await db.note.create({
    data: body.data,
    include: { device: { select: { id: true, name: true, ip: true } } },
  });

  void writeAudit({ action: "CREATE", entity: "Note", entityId: note.id, entityName: note.title, details: { severity: note.severity, category: note.category } });
  return NextResponse.json(note, { status: 201 });
}
