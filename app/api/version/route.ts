export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { execSync } from "child_process";

function exec(cmd: string): string {
  try { return execSync(cmd, { encoding: "utf8" }).trim(); }
  catch { return ""; }
}

export function GET() {
  const count = exec("git rev-list --count HEAD");
  const hash  = exec("git rev-parse --short HEAD");
  return NextResponse.json({
    version: "0.1.0",
    build:   count ? Number(count) : null,
    hash:    hash  || null,
  });
}
