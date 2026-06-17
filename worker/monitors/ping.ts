import ping from "ping";

export interface PingResult {
  alive: boolean;
  responseMs: number | null;
}

export async function checkPing(ip: string): Promise<PingResult> {
  try {
    const result = await ping.promise.probe(ip, {
      timeout: 5,
    });

    const alive = result.alive;
    const timeVal = result.time;
    const responseMs =
      alive && String(timeVal) !== "unknown" && !isNaN(Number(timeVal))
        ? Math.round(Number(timeVal))
        : alive ? 1 : null; // If alive but time is unknown (e.g. <1ms on Windows Portuguese), fallback to 1ms instead of null

    return { alive, responseMs };
  } catch (error) {
    console.error(`[Ping] Error pinging ${ip}:`, error);
    return { alive: false, responseMs: null };
  }
}
