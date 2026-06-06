/**
 * @jest-environment node
 */
import { GET } from "@/app/api/health/route";

jest.mock("@/lib/db", () => ({
  db: {
    statusHistory:   { count: jest.fn() },
    workerHeartbeat: { findUnique: jest.fn() },
  },
}));

import { db } from "@/lib/db";

const mockDb = db as jest.Mocked<typeof db>;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("GET /api/health", () => {
  it("returns uptimePct=100 when no history exists", async () => {
    (mockDb.statusHistory.count as jest.Mock).mockResolvedValue(0);
    (mockDb.workerHeartbeat.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.uptimePct).toBe(100);
    expect(body.workerStatus).toBe("unknown");
    expect(body.workerLastSeen).toBeNull();
  });

  it("calculates uptimePct correctly", async () => {
    (mockDb.statusHistory.count as jest.Mock)
      .mockResolvedValueOnce(100) // total
      .mockResolvedValueOnce(75); // online
    (mockDb.workerHeartbeat.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(body.uptimePct).toBeCloseTo(75);
    expect(body.totalChecks).toBe(100);
    expect(body.onlineChecks).toBe(75);
  });

  it("returns workerStatus=ok when heartbeat is recent (< 3 min)", async () => {
    jest.setSystemTime(new Date("2026-01-01T12:05:00Z"));
    (mockDb.statusHistory.count as jest.Mock).mockResolvedValue(0);
    (mockDb.workerHeartbeat.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      seenAt: new Date("2026-01-01T12:04:00Z"), // 1 minute ago
    });

    const res = await GET();
    const body = await res.json();

    expect(body.workerStatus).toBe("ok");
    expect(body.workerLastSeen).toBe("2026-01-01T12:04:00.000Z");
  });

  it("returns workerStatus=stale when heartbeat is older than 3 min", async () => {
    jest.setSystemTime(new Date("2026-01-01T12:10:00Z"));
    (mockDb.statusHistory.count as jest.Mock).mockResolvedValue(0);
    (mockDb.workerHeartbeat.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      seenAt: new Date("2026-01-01T12:00:00Z"), // 10 minutes ago
    });

    const res = await GET();
    const body = await res.json();

    expect(body.workerStatus).toBe("stale");
  });

  it("returns workerStatus=unknown when no heartbeat row exists", async () => {
    (mockDb.statusHistory.count as jest.Mock).mockResolvedValue(0);
    (mockDb.workerHeartbeat.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();

    expect(body.workerStatus).toBe("unknown");
  });

  it("returns workerStatus=ok at exactly the 3-minute boundary (180_000ms - 1)", async () => {
    const now = new Date("2026-01-01T12:00:00Z");
    jest.setSystemTime(now);
    (mockDb.statusHistory.count as jest.Mock).mockResolvedValue(0);
    (mockDb.workerHeartbeat.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      seenAt: new Date(now.getTime() - 179_999), // 1ms under the limit
    });

    const res = await GET();
    const body = await res.json();

    expect(body.workerStatus).toBe("ok");
  });

  it("returns workerStatus=stale at exactly 3 minutes", async () => {
    const now = new Date("2026-01-01T12:00:00Z");
    jest.setSystemTime(now);
    (mockDb.statusHistory.count as jest.Mock).mockResolvedValue(0);
    (mockDb.workerHeartbeat.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      seenAt: new Date(now.getTime() - 180_000), // exactly 3 min
    });

    const res = await GET();
    const body = await res.json();

    expect(body.workerStatus).toBe("stale");
  });
});
