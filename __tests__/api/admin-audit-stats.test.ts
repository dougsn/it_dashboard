/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    auditLog: { groupBy: jest.fn(), findMany: jest.fn() },
  },
}));

import { GET } from "@/app/api/admin/audit/stats/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.auditLog.groupBy as jest.Mock).mockResolvedValue([
    { action: "CREATE", _count: { id: 5 } },
    { action: "DELETE", _count: { id: 2 } },
  ]);
  (mockDb.auditLog.findMany as jest.Mock).mockResolvedValue([
    { timestamp: new Date(), action: "LOGIN", entityName: "admin", ipAddress: "127.0.0.1" },
  ]);
});

describe("GET /api/admin/audit/stats", () => {
  it("returns last24h, last7d, recentLogins and topUsers", async () => {
    // groupBy is called 3 times (last24h actions, last7d actions, topUsers)
    (mockDb.auditLog.groupBy as jest.Mock)
      .mockResolvedValueOnce([{ action: "CREATE", _count: { id: 3 } }])
      .mockResolvedValueOnce([{ action: "CREATE", _count: { id: 10 } }])
      .mockResolvedValueOnce([{ username: "admin", _count: { id: 10 } }]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.last24h).toBeDefined();
    expect(body.last7d).toBeDefined();
    expect(body.recentLogins).toBeDefined();
    expect(body.topUsers).toBeDefined();
  });

  it("returns totals as numbers", async () => {
    (mockDb.auditLog.groupBy as jest.Mock)
      .mockResolvedValueOnce([{ action: "CREATE", _count: { id: 5 } }, { action: "UPDATE", _count: { id: 3 } }])
      .mockResolvedValueOnce([{ action: "CREATE", _count: { id: 20 } }])
      .mockResolvedValueOnce([]);

    const res = await GET();
    const body = await res.json();
    expect(body.total24h).toBe(8);
    expect(body.total7d).toBe(20);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is VIEWER", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "VIEWER" } });
    const res = await GET();
    expect(res.status).toBe(403);
  });
});
