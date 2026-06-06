import { createHmac, timingSafeEqual } from "crypto";

export function validateSecret(): void {
  if (!process.env.WEBHOOK_SECRET) {
    throw new Error(
      "WEBHOOK_SECRET não está definido. Gere com: openssl rand -hex 32"
    );
  }
}

export function generateWebhookToken(linkId: string): string {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("WEBHOOK_SECRET não está definido.");
  }
  return createHmac("sha256", secret).update(linkId).digest("hex");
}

export function verifyWebhookToken(linkId: string, token: string): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return false;
  try {
    const expected = createHmac("sha256", secret).update(linkId).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
