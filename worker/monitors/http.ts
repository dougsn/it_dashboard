export interface HttpResult {
  ok: boolean;
  statusCode: number | null;
}

export async function checkHttp(
  ip: string,
  port: number = 80,
  path: string = "/"
): Promise<HttpResult> {
  const url = `http://${ip}:${port}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
    });
    return { ok: res.status < 500, statusCode: res.status };
  } catch {
    return { ok: false, statusCode: null };
  } finally {
    clearTimeout(timeout);
  }
}
