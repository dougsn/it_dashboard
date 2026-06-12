export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireRole, getSessionRole } from "@/lib/with-auth";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { parseBody } from "@/lib/parse-body";

const updateSchema = z.object({
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").optional(),
  role: z.enum(["ADMIN", "OPERADOR", "VIEWER"]).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const role = await getSessionRole();
  const sessionUserId = (session.user as { id?: string }).id;

  // Operador/viewer can only change their own password; admin can change anyone
  if (role !== "ADMIN" && sessionUserId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = await parseBody(req);
  if (!parsed.ok) return parsed.response;

  const result = updateSchema.safeParse(parsed.data);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { password, role: newRole } = result.data;

  // Only admin can change roles
  if (newRole && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: { password?: string; role?: "ADMIN" | "OPERADOR" | "VIEWER" } = {};
  if (password) data.password = await bcrypt.hash(password, 12);
  if (newRole) data.role = newRole;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id },
    data,
    select: { id: true, username: true, role: true, createdAt: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauth = await requireRole("ADMIN");
  if (unauth) return unauth;

  const session = await auth();
  const { id } = await params;
  const sessionUserId = (session!.user as { id?: string }).id;

  if (sessionUserId === id) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Prevent deleting the last admin
  if (user.role === "ADMIN") {
    const adminCount = await db.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Não é possível excluir o último administrador" }, { status: 400 });
    }
  }

  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
