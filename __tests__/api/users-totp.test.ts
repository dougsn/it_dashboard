/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "admin-1", name: "admin", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: jest.fn(), update: jest.fn() },
  },
}));

jest.mock("@/lib/audit", () => ({ writeAudit: jest.fn(), extractIp: jest.fn().mockReturnValue(null) }));

jest.mock("@/lib/totp", () => ({
  generateTotpSecret: jest.fn().mockReturnValue("SECRET123"),
  getTotpUri:         jest.fn().mockReturnValue("otpauth://totp/x"),
  verifyTotp:         jest.fn(),
  encryptSecret:      jest.fn().mockReturnValue("enc(SECRET123)"),
  decryptSecret:      jest.fn().mockReturnValue("SECRET123"),
}));

jest.mock("qrcode", () => ({ toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,xxx") }));

import { NextRequest } from "next/server";
import { GET, POST, DELETE } from "@/app/api/users/[id]/totp/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyTotp } from "@/lib/totp";

const mockDb = db as jest.Mocked<typeof db>;
const mockAuth = auth as unknown as jest.Mock;
const mockVerify = verifyTotp as jest.Mock;

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const body = (id: string, b: unknown) =>
  new NextRequest(`http://localhost/api/users/${id}/totp`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b),
  });

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "admin-1", name: "admin", role: "ADMIN" } });
  (mockDb.user.findUnique as jest.Mock).mockResolvedValue({ username: "bob", totpEnabled: false, totpSecret: null });
  (mockDb.user.update as jest.Mock).mockResolvedValue({});
});

describe("GET /api/users/[id]/totp", () => {
  it("admin generates secret + QR", async () => {
    const res = await GET(new NextRequest("http://localhost/api/users/u2/totp"), params("u2"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.secret).toBe("SECRET123");
    expect(data.qrDataUrl).toContain("data:image/png");
  });

  it("non-admin can manage their OWN TOTP", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u2", name: "bob", role: "VIEWER" } });
    const res = await GET(new NextRequest("http://localhost/api/users/u2/totp"), params("u2"));
    expect(res.status).toBe(200);
  });

  it("non-admin CANNOT manage another user's TOTP", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u2", name: "bob", role: "VIEWER" } });
    const res = await GET(new NextRequest("http://localhost/api/users/u3/totp"), params("u3"));
    expect(res.status).toBe(403);
  });

  it("returns 404 for unknown user", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/users/x/totp"), params("x"));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/users/[id]/totp (enable)", () => {
  it("enables TOTP with a valid token and encrypts the secret", async () => {
    mockVerify.mockResolvedValue(true);
    const res = await POST(body("u2", { token: "123456", secret: "SECRET123" }), params("u2"));
    expect(res.status).toBe(200);
    const updateArg = (mockDb.user.update as jest.Mock).mock.calls.at(-1)![0];
    expect(updateArg.data.totpEnabled).toBe(true);
    expect(updateArg.data.totpSecret).toBe("enc(SECRET123)");
  });

  it("rejects an invalid token with 422", async () => {
    mockVerify.mockResolvedValue(false);
    const res = await POST(body("u2", { token: "000000", secret: "SECRET123" }), params("u2"));
    expect(res.status).toBe(422);
    expect(mockDb.user.update).not.toHaveBeenCalled();
  });

  it("rejects malformed token (not 6 digits) with 400", async () => {
    const res = await POST(body("u2", { token: "12", secret: "SECRET123" }), params("u2"));
    expect(res.status).toBe(400);
  });

  it("requires the secret in the body", async () => {
    const res = await POST(body("u2", { token: "123456" }), params("u2"));
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/users/[id]/totp (disable)", () => {
  it("disables TOTP with a valid token", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({ totpEnabled: true, totpSecret: "enc" });
    mockVerify.mockResolvedValue(true);
    const req = new NextRequest("http://localhost/api/users/u2/totp", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: "123456" }),
    });
    const res = await DELETE(req, params("u2"));
    expect(res.status).toBe(200);
    const updateArg = (mockDb.user.update as jest.Mock).mock.calls.at(-1)![0];
    expect(updateArg.data.totpEnabled).toBe(false);
    expect(updateArg.data.totpSecret).toBeNull();
  });

  it("returns 400 when TOTP is not enabled", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({ totpEnabled: false, totpSecret: null });
    const req = new NextRequest("http://localhost/api/users/u2/totp", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: "123456" }),
    });
    const res = await DELETE(req, params("u2"));
    expect(res.status).toBe(400);
  });
});
