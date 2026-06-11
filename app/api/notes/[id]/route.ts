import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { parseAndValidate } from "@/lib/parse-body";
import { notFoundOnP2025 } from "@/lib/prisma-error";

const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  severity: z.enum(["INFO", "WARNING", "HIGH", "CRITICAL"]).optional(),
  category: z.enum(["SECURITY", "OPERATIONAL", "GENERAL"]).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
  deviceId: z.string().optional().nullable(),
  resolvedAt: z.string().datetime().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  const note = await db.note.findUnique({
    where: { id },
    include: { device: { select: { id: true, name: true, ip: true } } },
  });

  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(note);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  const body = await parseAndValidate(req, updateNoteSchema);
  if (!body.ok) return body.response;

  const data: Record<string, unknown> = { ...body.data };

  if (body.data.status === "RESOLVED" && body.data.resolvedAt === undefined) {
    data.resolvedAt = new Date().toISOString();
  }
  if (body.data.status === "OPEN" || body.data.status === "IN_PROGRESS") {
    if (body.data.resolvedAt === undefined) {
      data.resolvedAt = null;
    }
  }

  try {
    const note = await db.note.update({
      where: { id },
      data,
      include: { device: { select: { id: true, name: true, ip: true } } },
    });
    return NextResponse.json(note);
  } catch (err) {
    return notFoundOnP2025(err) ?? (() => { throw err; })();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const { id } = await params;
  try {
    await db.note.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return notFoundOnP2025(err) ?? (() => { throw err; })();
  }
}
