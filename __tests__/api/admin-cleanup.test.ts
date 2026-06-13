/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    systemConfig: { upsert: jest.fn(), update: jest.fn() },
    statusHistory: { deleteMany: jest.fn() },
    linkEvent: { deleteMany: jest.fn() },
  },
}));

jest.mock("@/lib/audit", () => ({ writeAudit: jest.fn() }));

import { POST } from "@/app/api/admin/cleanup/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.systemConfig.upsert as jest.Mock).mockResolvedValue({ id: 1, statusHistoryDays: 30, linkEventDays: 90 });
  (mockDb.statusHistory.deleteMany as jest.Mock).mockResolvedValue({ count: 100 });
  (mockDb.linkEvent.deleteMany as jest.Mock).mockResolvedValue({ count: 50 });
  (mockDb.systemConfig.update as jest.Mock).mockResolvedValue({});
});

describe("POST /api/admin/cleanup", () => {
  it("deletes history and events and returns counts", async () => {
    const res = await POST();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.deletedStatusHistory).toBe(100);
    expect(body.deletedLinkEvents).toBe(50);
    expect(body.cutoffs.statusHistory).toBeDefined();
    expect(body.cutoffs.linkEvents).toBeDefined();
  });

  it("calls deleteMany with correct date cutoffs based on config", async () => {
    (mockDb.systemConfig.upsert as jest.Mock).mockResolvedValue({ id: 1, statusHistoryDays: 7, linkEventDays: 14 });
    await POST();

    const historyCall = (mockDb.statusHistory.deleteMany as jest.Mock).mock.calls[0][0];
    const eventCall = (mockDb.linkEvent.deleteMany as jest.Mock).mock.calls[0][0];

    const now = Date.now();
    const historyAge = now - historyCall.where.timestamp.lt.getTime();
    const eventAge = now - eventCall.where.timestamp.lt.getTime();

    // Should be approx 7 days (±60s tolerance)
    expect(historyAge).toBeGreaterThan(7 * 24 * 3600 * 1000 - 60_000);
    expect(eventAge).toBeGreaterThan(14 * 24 * 3600 * 1000 - 60_000);
  });

  it("updates lastCleanupAt after cleanup", async () => {
    await POST();
    expect(mockDb.systemConfig.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { lastCleanupAt: expect.any(Date) } })
    );
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is OPERADOR", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "OPERADOR" } });
    const res = await POST();
    expect(res.status).toBe(403);
  });
});
