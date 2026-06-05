import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  mikrotikDeviceId: z.string().optional().nullable(),
  mikrotikInterface: z.string().max(50).optional().nullable(),
  contractedDownloadBps: z.number().int().positive().optional().nullable(),
  contractedUploadBps: z.number().int().positive().optional().nullable(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const link = await db.link.findUnique({ where: { id } });
  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(link);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const link = await db.link.update({ where: { id }, data: parsed.data });
  return NextResponse.json(link);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.link.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
