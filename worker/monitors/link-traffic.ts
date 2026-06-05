import { RouterOSAPI } from "routeros";

export interface LinkTrafficResult {
  downloadBps: number;
  uploadBps: number;
}

export async function checkLinkTraffic(
  ip: string,
  user: string,
  password: string,
  port: number,
  iface: string,
): Promise<LinkTrafficResult> {
  const conn = new RouterOSAPI({ host: ip, user, password, port, timeout: 8000 });
  await conn.connect();

  try {
    const [data] = await conn.write("/interface/monitor-traffic", [
      `=interface=${iface}`,
      "=count=1",
    ]);

    return {
      downloadBps: Number(data["rx-bits-per-second"] ?? 0),
      uploadBps:   Number(data["tx-bits-per-second"] ?? 0),
    };
  } finally {
    conn.close();
  }
}
