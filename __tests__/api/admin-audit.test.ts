/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    auditLog: { findMany: jest.fn(), count: jest.fn() },
  },
}));

import { GET } from "@/app/api/admin/audit/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

const LOG = { id: "l1", action: "CREATE", entity: "Device", entityName: "Router", timestamp: new Date() };

function makeReq(qs = "") {
  return new Request(`http://localhost/api/admin/audit${qs ? `?${qs}` : ""}`);
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.auditLog.findMany as jest.Mock).mockResolvedValue([LOG]);
  (mockDb.auditLog.count as jest.Mock).mockResolvedValue(1);
});

describe("GET /api/admin/audit", () => {
  it("returns logs with pagination", async () => {
    const res = await GET(makeReq() as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.logs).toHaveLength(1);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.total).toBe(1);
  });

  it("filters by action param", async () => {
    await GET(makeReq("action=CREATE") as any);
    const call = (mockDb.auditLog.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.action).toBe("CREATE");
  });

  it("filters by entity param", async () => {
    await GET(makeReq("entity=Device") as any);
    const call = (mockDb.auditLog.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.entity).toBe("Device");
  });

  it("filters by date range", async () => {
    await GET(makeReq("from=2026-01-01&to=2026-01-31") as any);
    const call = (mockDb.auditLog.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.timestamp?.gte).toBeInstanceOf(Date);
    expect(call.where.timestamp?.lte).toBeInstanceOf(Date);
  });

  it("returns 400 for invalid 'from' date", async () => {
    const res = await GET(makeReq("from=garbage") as any);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid 'to' date", async () => {
    const res = await GET(makeReq("to=not-a-date") as any);
    expect(res.status).toBe(400);
  });

  it("handles page param", async () => {
    await GET(makeReq("page=3") as any);
    const call = (mockDb.auditLog.findMany as jest.Mock).mock.calls[0][0];
    expect(call.skip).toBe(100); // page 3 = skip 2 * 50
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET(makeReq() as any);
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is VIEWER", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "VIEWER" } });
    const res = await GET(makeReq() as any);
    expect(res.status).toBe(403);
  });
});
