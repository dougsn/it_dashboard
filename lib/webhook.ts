import { createHmac, timingSafeEqual } from "crypto";

const secret = process.env.WEBHOOK_SECRET;

export function generateWebhookToken(linkId: string): string {
  if (!secret) {
    throw new Error("WEBHOOK_SECRET não está definido.");
  }
  return createHmac("sha256", secret).update(linkId).digest("hex");
}

export function verifyWebhookToken(linkId: string, token: string): boolean {
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
