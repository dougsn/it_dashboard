import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/with-auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { parseAndValidate } from "@/lib/parse-body";

const noteSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(200),
  content: z.string().min(1, "Conteúdo obrigatório"),
  severity: z.enum(["INFO", "WARNING", "HIGH", "CRITICAL"]).default("INFO"),
  category: z.enum(["SECURITY", "OPERATIONAL", "GENERAL"]).default("GENERAL"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).default("OPEN"),
  deviceId: z.string().optional().nullable(),
});

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const notes = await db.note.findMany({
    include: { device: { select: { id: true, name: true, ip: true } } },
    orderBy: [
      { severity: "desc" },
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  const body = await parseAndValidate(req, noteSchema);
  if (!body.ok) return body.response;

  const note = await db.note.create({
    data: body.data,
    include: { device: { select: { id: true, name: true, ip: true } } },
  });

  return NextResponse.json(note, { status: 201 });
}
