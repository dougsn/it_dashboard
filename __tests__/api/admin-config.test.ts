/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: { systemConfig: { upsert: jest.fn() } },
}));

jest.mock("@/lib/audit", () => ({ writeAudit: jest.fn() }));

import { GET, PUT } from "@/app/api/admin/config/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

const CONFIG = { id: 1, statusHistoryDays: 30, linkEventDays: 90 };

function makePutReq(body: unknown) {
  return new Request("http://localhost/api/admin/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.systemConfig.upsert as jest.Mock).mockResolvedValue(CONFIG);
});

describe("GET /api/admin/config", () => {
  it("returns current config (upsert with empty update)", async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.statusHistoryDays).toBe(30);
    expect(body.linkEventDays).toBe(90);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/admin/config", () => {
  it("updates retention config", async () => {
    (mockDb.systemConfig.upsert as jest.Mock).mockResolvedValue({
      ...CONFIG,
      statusHistoryDays: 60,
      linkEventDays: 180,
    });
    const res = await PUT(makePutReq({ statusHistoryDays: 60, linkEventDays: 180 }) as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.statusHistoryDays).toBe(60);
  });

  it("returns 400 for invalid values (out of range)", async () => {
    const res = await PUT(makePutReq({ statusHistoryDays: 0, linkEventDays: 90 }) as any);
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("http://localhost/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "bad",
    });
    const res = await PUT(req as any);
    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await PUT(makePutReq({ statusHistoryDays: 30, linkEventDays: 90 }) as any);
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is VIEWER", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "VIEWER" } });
    const res = await PUT(makePutReq({ statusHistoryDays: 30, linkEventDays: 90 }) as any);
    expect(res.status).toBe(403);
  });
});
