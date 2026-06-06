import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { parseBody } from "@/lib/parse-body";

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
  const raw = await parseBody(req);
  if (!raw.ok) return raw.response;
  const parsed = updateSchema.safeParse(raw.data);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const link = await db.link.update({ where: { id }, data: parsed.data });
    return NextResponse.json(link);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.link.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    throw err;
  }
}
