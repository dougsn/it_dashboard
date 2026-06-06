import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deviceId } = await params;
  const { searchParams } = new URL(req.url);
  const hours = Math.min(parseInt(searchParams.get("hours") ?? "") || 24, 168);

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const history = await db.statusHistory.findMany({
    where: { deviceId, timestamp: { gte: since } },
    orderBy: { timestamp: "asc" },
    take: 500,
  });

  return NextResponse.json(history);
}
