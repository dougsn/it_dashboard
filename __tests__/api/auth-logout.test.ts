/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", name: "admin" } }),
}));

jest.mock("@/lib/db", () => ({
  db: { tokenBlacklist: { create: jest.fn() } },
}));

jest.mock("@/lib/audit", () => ({ writeAudit: jest.fn(), extractIp: jest.fn().mockReturnValue(null) }));

jest.mock("next-auth/jwt", () => ({ getToken: jest.fn() }));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/logout/route";
import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";

const mockDb = db as jest.Mocked<typeof db>;
const mockGetToken = getToken as jest.Mock;

const req = () => new NextRequest("http://localhost/api/auth/logout", { method: "POST" });

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.tokenBlacklist.create as jest.Mock).mockResolvedValue({});
});

describe("POST /api/auth/logout", () => {
  it("blacklists the token jti and clears the session cookie", async () => {
    mockGetToken.mockResolvedValue({ jti: "jti-123", exp: Math.floor(Date.now() / 1000) + 3600 });
    const res = await POST(req());
    expect(res.status).toBe(200);
    const createArg = (mockDb.tokenBlacklist.create as jest.Mock).mock.calls[0][0];
    expect(createArg.data.jti).toBe("jti-123");
    expect(createArg.data.expiresAt).toBeInstanceOf(Date);
    // session cookie cleared (maxAge 0)
    const cookie = res.cookies.get("authjs.session-token");
    expect(cookie?.value).toBe("");
  });

  it("is idempotent when the jti is already blacklisted", async () => {
    mockGetToken.mockResolvedValue({ jti: "dup" });
    (mockDb.tokenBlacklist.create as jest.Mock).mockRejectedValue(new Error("unique"));
    const res = await POST(req());
    expect(res.status).toBe(200);
  });

  it("does not blacklist when the token has no jti", async () => {
    mockGetToken.mockResolvedValue({});
    const res = await POST(req());
    expect(res.status).toBe(200);
    expect(mockDb.tokenBlacklist.create).not.toHaveBeenCalled();
  });

  it("does not crash when there is no token/session", async () => {
    mockGetToken.mockResolvedValue(null);
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await POST(req());
    expect(res.status).toBe(200);
  });
});
