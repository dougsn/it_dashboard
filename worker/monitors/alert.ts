import { log } from "../../lib/logger";

export interface AlertPayload {
  deviceId:   string;
  deviceName: string;
  deviceIp:   string;
  deviceType: string;
  failCount:  number;
  timestamp:  string;
}

const ALERT_COOLDOWN_MS = 60 * 60 * 1_000; // 1 hour

export function isCooldownActive(lastAlertAt: Date | null): boolean {
  if (!lastAlertAt) return false;
  return Date.now() - lastAlertAt.getTime() < ALERT_COOLDOWN_MS;
}

export async function sendAlert(webhookUrl: string, payload: AlertPayload): Promise<void> {
  const body = JSON.stringify(payload);
  const res = await fetch(webhookUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal:  AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`Alerta rejeitado pelo webhook: HTTP ${res.status}`);
  }
  log("info", "[Alerta] webhook disparado", { device: payload.deviceName, failCount: payload.failCount, url: webhookUrl });
}
