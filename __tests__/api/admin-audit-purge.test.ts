/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: { auditLog: { deleteMany: jest.fn() } },
}));

jest.mock("@/lib/audit", () => ({ writeAudit: jest.fn() }));

import { POST } from "@/app/api/admin/audit/purge/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

function makeReq(body: unknown) {
  return new Request("http://localhost/api/admin/audit/purge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.auditLog.deleteMany as jest.Mock).mockResolvedValue({ count: 42 });
});

describe("POST /api/admin/audit/purge", () => {
  it("deletes logs older than specified days", async () => {
    const res = await POST(makeReq({ olderThanDays: 90, confirmation: "CONFIRMAR" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.deleted).toBe(42);
    expect(body.cutoff).toBeDefined();
  });

  it("returns 400 without confirmation phrase", async () => {
    const res = await POST(makeReq({ olderThanDays: 90, confirmation: "wrong" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when olderThanDays < 30", async () => {
    const res = await POST(makeReq({ olderThanDays: 1, confirmation: "CONFIRMAR" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("http://localhost/api/admin/audit/purge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "bad",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ olderThanDays: 90, confirmation: "CONFIRMAR" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is OPERADOR", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "OPERADOR" } });
    const res = await POST(makeReq({ olderThanDays: 90, confirmation: "CONFIRMAR" }));
    expect(res.status).toBe(403);
  });
});
