import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { parseBody } from "@/lib/parse-body";

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
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const raw = await parseBody(req);
  if (!raw.ok) return raw.response;
  const parsed = updateNoteSchema.safeParse(raw.data);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };

  // Auto-set resolvedAt when status changes to RESOLVED
  if (parsed.data.status === "RESOLVED" && parsed.data.resolvedAt === undefined) {
    data.resolvedAt = new Date().toISOString();
  }
  // Clear resolvedAt when reopening
  if (parsed.data.status === "OPEN" || parsed.data.status === "IN_PROGRESS") {
    if (parsed.data.resolvedAt === undefined) {
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
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.note.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}
