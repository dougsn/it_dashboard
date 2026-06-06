/**
 * @jest-environment node
 */

import { generateWebhookToken, verifyWebhookToken, validateSecret } from "@/lib/webhook";

const VALID_SECRET = "test-secret-for-jest-at-least-32chars!";

beforeEach(() => {
  process.env.WEBHOOK_SECRET = VALID_SECRET;
});

afterEach(() => {
  delete process.env.WEBHOOK_SECRET;
});

describe("generateWebhookToken", () => {
  it("returns a 64-character hex string", () => {
    const token = generateWebhookToken("link-123");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns the same token for the same linkId", () => {
    expect(generateWebhookToken("link-abc")).toBe(generateWebhookToken("link-abc"));
  });

  it("returns different tokens for different linkIds", () => {
    expect(generateWebhookToken("link-1")).not.toBe(generateWebhookToken("link-2"));
  });

  it("throws when WEBHOOK_SECRET is not set", () => {
    delete process.env.WEBHOOK_SECRET;
    expect(() => generateWebhookToken("link-1")).toThrow("WEBHOOK_SECRET");
  });
});

describe("validateSecret", () => {
  it("does not throw when WEBHOOK_SECRET is 32+ characters", () => {
    expect(() => validateSecret()).not.toThrow();
  });

  it("throws when WEBHOOK_SECRET is missing", () => {
    delete process.env.WEBHOOK_SECRET;
    expect(() => validateSecret()).toThrow("WEBHOOK_SECRET");
  });

  it("throws when WEBHOOK_SECRET is shorter than 32 characters", () => {
    process.env.WEBHOOK_SECRET = "tooshort";
    expect(() => validateSecret()).toThrow("WEBHOOK_SECRET");
  });

  it("accepts a secret of exactly 32 characters", () => {
    process.env.WEBHOOK_SECRET = "a".repeat(32);
    expect(() => validateSecret()).not.toThrow();
  });
});

describe("verifyWebhookToken", () => {
  it("returns true for a valid token", () => {
    const token = generateWebhookToken("link-abc");
    expect(verifyWebhookToken("link-abc", token)).toBe(true);
  });

  it("returns false for a tampered token", () => {
    const token = generateWebhookToken("link-abc");
    const tampered = token.slice(0, -1) + (token.endsWith("f") ? "0" : "f");
    expect(verifyWebhookToken("link-abc", tampered)).toBe(false);
  });

  it("returns false for a token of different length", () => {
    expect(verifyWebhookToken("link-abc", "tooshort")).toBe(false);
  });

  it("returns false for a token from a different linkId", () => {
    const token = generateWebhookToken("link-xyz");
    expect(verifyWebhookToken("link-abc", token)).toBe(false);
  });

  it("returns false when WEBHOOK_SECRET is not set", () => {
    const token = generateWebhookToken("link-abc");
    delete process.env.WEBHOOK_SECRET;
    expect(verifyWebhookToken("link-abc", token)).toBe(false);
  });
});
