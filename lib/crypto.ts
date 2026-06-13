import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY deve ser uma string hex de 64 caracteres (32 bytes). Gere com: openssl rand -hex 32"
    );
  }
  return Buffer.from(hex, "hex");
}

export function validateKey(): void {
  getKey(); // throws if ENCRYPTION_KEY is missing or malformed
}

export function encrypt(plain: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

export function decrypt(stored: string): string {
  const key = getKey();
  const [ivHex, tagHex, dataHex] = stored.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Formato de credencial criptografada inválido");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return decipher.update(Buffer.from(dataHex, "hex")).toString("utf8") + decipher.final("utf8");
}

export function resolveRouterosCredentials(device: {
  routerosUserEnc: string | null;
  routerosPassEnc: string | null;
}): { user: string; pass: string } | null {
  const user = device.routerosUserEnc ? decrypt(device.routerosUserEnc) : null;
  const pass = device.routerosPassEnc ? decrypt(device.routerosPassEnc) : null;
  if (!user || !pass) return null;
  return { user, pass };
}

export function resolveUnifiApiKey(device: {
  unifiApiKeyEnc: string | null;
}): string | null {
  return device.unifiApiKeyEnc ? decrypt(device.unifiApiKeyEnc) : null;
}

export function resolveUnifiCredentials(device: {
  unifiUserEnc: string | null;
  unifiPassEnc: string | null;
}): { username: string; password: string } | null {
  const username = device.unifiUserEnc ? decrypt(device.unifiUserEnc) : null;
  const password = device.unifiPassEnc ? decrypt(device.unifiPassEnc) : null;
  if (!username || !password) return null;
  return { username, password };
}

export function resolveOmadaCredentials(device: {
  omadaClientIdEnc:     string | null;
  omadaClientSecretEnc: string | null;
}): { clientId: string; clientSecret: string } | null {
  const clientId     = device.omadaClientIdEnc     ? decrypt(device.omadaClientIdEnc)     : null;
  const clientSecret = device.omadaClientSecretEnc ? decrypt(device.omadaClientSecretEnc) : null;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}
