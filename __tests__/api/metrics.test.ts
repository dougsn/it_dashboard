/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: {
    device: { findMany: jest.fn() },
    statusHistory: { count: jest.fn(), groupBy: jest.fn() },
    workerHeartbeat: { findUnique: jest.fn() },
  },
}));

import { GET } from "@/app/api/metrics/route";
import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

const BASE_DEVICE = {
  id: "dev1",
  name: "Router",
  type: "MIKROTIK",
  location: "HQ",
  currentStatus: { isOnline: true, pingMs: 5, checkedAt: new Date() },
};

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.device.findMany as jest.Mock).mockResolvedValue([BASE_DEVICE]);
  (mockDb.statusHistory.count as jest.Mock).mockResolvedValue(100);
  (mockDb.statusHistory.groupBy as jest.Mock).mockResolvedValue([
    { deviceId: "dev1", _avg: { pingMs: 12.5 } },
  ]);
  (mockDb.workerHeartbeat.findUnique as jest.Mock).mockResolvedValue({
    id: 1,
    seenAt: new Date(Date.now() - 30_000),
  });
});

describe("GET /api/metrics", () => {
  it("returns Prometheus text format", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
  });

  it("includes device online/offline gauges", async () => {
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("watchit_devices_total");
    expect(text).toContain("watchit_devices_online");
    expect(text).toContain("watchit_devices_offline");
    expect(text).toContain("watchit_device_online");
  });

  it("includes uptime and heartbeat metrics", async () => {
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("watchit_uptime_pct_24h");
    expect(text).toContain("watchit_worker_heartbeat_age_seconds");
  });

  it("includes per-device ping average when history exists", async () => {
    const res = await GET();
    const text = await res.text();
    expect(text).toContain("watchit_device_ping_avg_ms");
    expect(text).toContain("12.50");
  });

  it("reports negative heartbeat age when no heartbeat exists", async () => {
    (mockDb.workerHeartbeat.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET();
    const text = await res.text();
    // workerAgeMs = -1 → value = -1/1000 = -0.001
    expect(text).toContain("watchit_worker_heartbeat_age_seconds -0.001");
  });

  it("reports device as offline when currentStatus.isOnline is false", async () => {
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([
      { ...BASE_DEVICE, currentStatus: { isOnline: false, pingMs: null, checkedAt: new Date() } },
    ]);
    const res = await GET();
    const text = await res.text();
    expect(text).toContain(`watchit_device_online{`) ;
    expect(text).toContain("} 0");
    expect(text).toContain("watchit_devices_offline 1");
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("escapes special characters in device names", async () => {
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([
      { ...BASE_DEVICE, name: 'Router "Main"', location: "HQ\nRack" },
    ]);
    const res = await GET();
    const text = await res.text();
    expect(text).not.toContain('"Router "Main""');
    expect(text).toContain('\\"');
  });
});
