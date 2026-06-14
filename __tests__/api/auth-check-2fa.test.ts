/**
 * @jest-environment node
 */
jest.mock("@/lib/db", () => ({
  db: { user: { findUnique: jest.fn() } },
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/auth/check-2fa/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;
const req = (qs: string) => new NextRequest(`http://localhost/api/auth/check-2fa${qs}`);

beforeEach(() => jest.clearAllMocks());

describe("GET /api/auth/check-2fa", () => {
  it("returns totpEnabled=true for a user with 2FA", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({ totpEnabled: true });
    const res = await GET(req("?username=alice"));
    expect(res.status).toBe(200);
    expect((await res.json()).totpEnabled).toBe(true);
  });

  it("returns totpEnabled=false for a user without 2FA", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue({ totpEnabled: false });
    const res = await GET(req("?username=bob"));
    expect((await res.json()).totpEnabled).toBe(false);
  });

  it("returns false for a non-existent user (no enumeration distinction)", async () => {
    (mockDb.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET(req("?username=ghost"));
    expect((await res.json()).totpEnabled).toBe(false);
  });

  it("returns false when username is missing (no DB lookup)", async () => {
    const res = await GET(req(""));
    expect((await res.json()).totpEnabled).toBe(false);
    expect(mockDb.user.findUnique).not.toHaveBeenCalled();
  });
});
