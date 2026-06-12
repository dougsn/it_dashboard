import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type Role = "ADMIN" | "OPERADOR" | "VIEWER";

const ROLE_LEVEL: Record<Role, number> = { ADMIN: 3, OPERADOR: 2, VIEWER: 1 };

function getRole(session: Session): Role {
  return ((session.user as { role?: string })?.role as Role) ?? "VIEWER";
}

async function getSession(): Promise<Session | null> {
  return auth() as Promise<Session | null>;
}

export async function requireAuth(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function requireRole(minRole: Role): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ROLE_LEVEL[getRole(session)] < ROLE_LEVEL[minRole]) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function getSessionRole(): Promise<Role | null> {
  const session = await getSession();
  if (!session) return null;
  return getRole(session);
}
