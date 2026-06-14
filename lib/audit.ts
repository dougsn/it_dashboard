import { db } from "@/lib/db";
import type { AuditAction } from "@prisma/client";

interface AuditEntry {
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  entityName?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  // When provided, skips the auth() lookup — required inside auth callbacks to avoid circular calls
  userId?: string | null;
  username?: string | null;
}

export function extractIp(req: Request): string | null {
  // X-Forwarded-For / X-Real-IP are client-spoofable unless a trusted reverse
  // proxy sets them. Only honor them when TRUST_PROXY is explicitly enabled.
  if (process.env.TRUST_PROXY === "true") {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return req.headers.get("x-real-ip") ?? null;
  }
  return null;
}

export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    let userId: string | null;
    let username: string | null;

    if ("userId" in entry) {
      userId   = entry.userId   ?? null;
      username = entry.username ?? null;
    } else {
      const { auth } = await import("@/lib/auth");
      const session = await auth();
      const user = session?.user as { id?: string; name?: string } | undefined;
      userId   = user?.id   ?? null;
      username = user?.name ?? null;
    }

    await db.auditLog.create({
      data: {
        action:     entry.action,
        entity:     entry.entity,
        entityId:   entry.entityId   ?? null,
        entityName: entry.entityName ?? null,
        ipAddress:  entry.ipAddress  ?? null,
        details:    entry.details as import("@prisma/client").Prisma.InputJsonValue | undefined,
        userId,
        username,
      },
    });
  } catch (err) {
    console.error("[audit] falha ao registrar log:", err instanceof Error ? err.message : String(err));
  }
}
