/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: { auditLog: { findMany: jest.fn() } },
}));

import { GET } from "@/app/api/admin/audit/export/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

const LOG = {
  id: "l1",
  timestamp: new Date("2026-01-01T12:00:00Z"),
  username: "admin",
  ipAddress: "127.0.0.1",
  action: "CREATE",
  entity: "Device",
  entityName: "Router",
  entityId: "dev1",
  details: { foo: "bar" },
};

function makeReq(qs = "") {
  return new Request(`http://localhost/api/admin/audit/export${qs ? `?${qs}` : ""}`);
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.auditLog.findMany as jest.Mock).mockResolvedValue([LOG]);
});

describe("GET /api/admin/audit/export", () => {
  it("returns CSV content-type", async () => {
    const res = await GET(makeReq() as any);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
  });

  it("includes CSV headers row", async () => {
    const res = await GET(makeReq() as any);
    const text = await res.text();
    expect(text).toContain("id,timestamp,username");
  });

  it("includes log data in CSV", async () => {
    const res = await GET(makeReq() as any);
    const text = await res.text();
    expect(text).toContain("admin");
    expect(text).toContain("CREATE");
    expect(text).toContain("Router");
  });

  it("escapes injection characters with leading apostrophe", async () => {
    (mockDb.auditLog.findMany as jest.Mock).mockResolvedValue([
      { ...LOG, entityName: "=HYPERLINK(\"http://evil.com\")" },
    ]);
    const res = await GET(makeReq() as any);
    const text = await res.text();
    expect(text).toContain("'=HYPERLINK");
  });

  it("filters by action", async () => {
    await GET(makeReq("action=DELETE") as any);
    const call = (mockDb.auditLog.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.action).toBe("DELETE");
  });

  it("filters by entity", async () => {
    await GET(makeReq("entity=User") as any);
    const call = (mockDb.auditLog.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.entity).toBe("User");
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET(makeReq() as any);
    expect(res.status).toBe(401);
  });
});
