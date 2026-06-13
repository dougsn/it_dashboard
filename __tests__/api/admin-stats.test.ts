/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    $queryRaw: jest.fn(),
    statusHistory: { count: jest.fn(), findFirst: jest.fn() },
    linkEvent: { count: jest.fn() },
    device: { count: jest.fn() },
    user: { count: jest.fn() },
    note: { count: jest.fn() },
    link: { count: jest.fn() },
    workerHeartbeat: { findFirst: jest.fn() },
    systemConfig: { findFirst: jest.fn() },
  },
}));

import { GET } from "@/app/api/admin/stats/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

beforeEach(() => {
  jest.clearAllMocks();
  // $queryRaw is called twice: db size and table sizes
  (mockDb.$queryRaw as jest.Mock)
    .mockResolvedValueOnce([{ size: "10 MB", size_bytes: BigInt(10_000_000) }])
    .mockResolvedValueOnce([
      { table_name: "Device", row_estimate: BigInt(5), total_size: "1 MB", total_bytes: BigInt(1_000_000) },
    ]);
  (mockDb.statusHistory.count as jest.Mock).mockResolvedValue(1000);
  (mockDb.linkEvent.count as jest.Mock).mockResolvedValue(50);
  (mockDb.device.count as jest.Mock).mockResolvedValue(10);
  (mockDb.user.count as jest.Mock).mockResolvedValue(3);
  (mockDb.note.count as jest.Mock).mockResolvedValue(5);
  (mockDb.link.count as jest.Mock).mockResolvedValue(2);
  (mockDb.statusHistory.findFirst as jest.Mock)
    .mockResolvedValueOnce({ timestamp: new Date("2025-01-01") })
    .mockResolvedValueOnce({ timestamp: new Date("2026-01-01") });
  (mockDb.workerHeartbeat.findFirst as jest.Mock).mockResolvedValue({
    seenAt: new Date(Date.now() - 60_000),
  });
  (mockDb.systemConfig.findFirst as jest.Mock).mockResolvedValue({
    statusHistoryDays: 30,
    linkEventDays: 90,
    lastCleanupAt: null,
  });
});

describe("GET /api/admin/stats", () => {
  it("returns database size and counts", async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.database.size).toBe("10 MB");
    expect(body.counts.devices).toBe(10);
    expect(body.counts.users).toBe(3);
    expect(body.counts.statusHistory).toBe(1000);
  });

  it("returns table list", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.tables).toHaveLength(1);
    expect(body.tables[0].name).toBe("Device");
    expect(body.tables[0].rowEstimate).toBe(5);
  });

  it("converts BigInt to number in serialized response", async () => {
    const res = await GET();
    const body = await res.json();
    expect(typeof body.database.sizeBytes).toBe("number");
    expect(typeof body.tables[0].totalBytes).toBe("number");
  });

  it("reports worker as alive when heartbeat is recent", async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.worker.isAlive).toBe(true);
  });

  it("reports worker as dead when no heartbeat", async () => {
    (mockDb.workerHeartbeat.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await GET();
    const body = await res.json();
    expect(body.worker.isAlive).toBe(false);
    expect(body.worker.lastSeenAt).toBeNull();
  });

  it("returns 500 on DB error", async () => {
    // Clear the beforeEach queue then set a persistent rejection
    (mockDb.$queryRaw as jest.Mock).mockReset().mockRejectedValue(new Error("db boom"));
    const res = await GET();
    expect(res.status).toBe(500);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is OPERADOR", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "OPERADOR" } });
    const res = await GET();
    expect(res.status).toBe(403);
  });
});
