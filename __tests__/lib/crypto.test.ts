/**
 * @jest-environment node
 */

import { encrypt, decrypt, resolveRouterosCredentials } from "@/lib/crypto";

const TEST_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

beforeEach(() => {
  process.env.ENCRYPTION_KEY = TEST_KEY;
});

afterEach(() => {
  delete process.env.ENCRYPTION_KEY;
});

describe("encrypt / decrypt", () => {
  it("round-trips plaintext correctly", () => {
    const original = "admin";
    expect(decrypt(encrypt(original))).toBe(original);
  });

  it("round-trips strings with special characters", () => {
    const original = "p@$$w0rd!üñïcödé";
    expect(decrypt(encrypt(original))).toBe(original);
  });

  it("produces different ciphertext on each call (random IV)", () => {
    const a = encrypt("same");
    const b = encrypt("same");
    expect(a).not.toBe(b);
  });

  it("throws when ENCRYPTION_KEY is missing", () => {
    delete process.env.ENCRYPTION_KEY;
    expect(() => encrypt("x")).toThrow("ENCRYPTION_KEY");
    expect(() => decrypt("iv:tag:data")).toThrow("ENCRYPTION_KEY");
  });

  it("throws when ENCRYPTION_KEY has wrong length", () => {
    process.env.ENCRYPTION_KEY = "tooshort";
    expect(() => encrypt("x")).toThrow("ENCRYPTION_KEY");
  });

  it("throws on malformed stored string (missing segments)", () => {
    expect(() => decrypt("onlyone")).toThrow("Formato de credencial criptografada inválido");
    expect(() => decrypt("two:parts")).toThrow("Formato de credencial criptografada inválido");
  });

  it("throws on tampered ciphertext (GCM auth tag mismatch)", () => {
    const stored = encrypt("secret");
    const parts = stored.split(":");
    parts[2] = "deadbeef"; // corrupt the ciphertext
    expect(() => decrypt(parts.join(":"))).toThrow();
  });
});

describe("resolveRouterosCredentials", () => {
  it("returns decrypted credentials when enc columns are set", () => {
    const result = resolveRouterosCredentials({
      routerosUserEnc: encrypt("admin"),
      routerosPassEnc: encrypt("pass123"),
    });
    expect(result).toEqual({ user: "admin", pass: "pass123" });
  });

  it("returns null when both enc columns are null", () => {
    expect(
      resolveRouterosCredentials({
        routerosUserEnc: null,
        routerosPassEnc: null,
      })
    ).toBeNull();
  });

  it("returns null when only user enc is set (no pass)", () => {
    expect(
      resolveRouterosCredentials({
        routerosUserEnc: encrypt("admin"),
        routerosPassEnc: null,
      })
    ).toBeNull();
  });

  it("returns null when only pass enc is set (no user)", () => {
    expect(
      resolveRouterosCredentials({
        routerosUserEnc: null,
        routerosPassEnc: encrypt("pass123"),
      })
    ).toBeNull();
  });
});
