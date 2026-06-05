import { RouterOSAPI } from "routeros";

export interface RouterOSResult {
  uptime: number | null;
  cpuLoad: number | null;
  memoryUsed: number | null;
}

function parseUptime(str: string): number {
  const weeks = parseInt(str.match(/(\d+)w/)?.[1] ?? "0");
  const days  = parseInt(str.match(/(\d+)d/)?.[1] ?? "0");
  const hours = parseInt(str.match(/(\d+)h/)?.[1] ?? "0");
  const mins  = parseInt(str.match(/(\d+)m/)?.[1] ?? "0");
  const secs  = parseInt(str.match(/(\d+)s/)?.[1] ?? "0");
  return weeks * 604800 + days * 86400 + hours * 3600 + mins * 60 + secs;
}

export async function checkRouterOS(
  ip: string,
  username: string,
  password: string,
  port: number = 8728
): Promise<RouterOSResult> {
  const conn = new RouterOSAPI({
    host: ip,
    user: username,
    password,
    port,
    timeout: 8000,
  });

  try {
    await conn.connect();

    const [resource] = await conn.write("/system/resource/print");

    conn.close();

    const uptime = resource?.["uptime"]
      ? parseUptime(String(resource["uptime"]))
      : null;

    const cpuLoad =
      resource?.["cpu-load"] != null ? Number(resource["cpu-load"]) : null;

    const totalMem = Number(resource?.["total-memory"] ?? 0);
    const freeMem  = Number(resource?.["free-memory"]  ?? 0);
    const memoryUsed =
      totalMem > 0 ? ((totalMem - freeMem) / totalMem) * 100 : null;

    return { uptime, cpuLoad, memoryUsed };
  } catch (err) {
    try { conn.close(); } catch {}
    throw err; // re-throw so the scheduler can log it
  }
}
