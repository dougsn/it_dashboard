/**
 * @jest-environment node
 */
import { GET } from "@/app/api/incidents/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    device: { findMany: jest.fn() },
    $queryRaw: jest.fn(),
  },
}));

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb = db as unknown as { device: { findMany: jest.Mock }; $queryRaw: jest.Mock };

const FAKE_SESSION = { user: { id: "user-1", name: "admin", role: "ADMIN" }, expires: "2099-01-01" };

function makeReq(params = "") {
  return new NextRequest(`http://localhost/api/incidents${params}`);
}

// device metadata returned by findMany (no history)
const DEVICE_META = [{ id: "device-1", name: "Router SP", ip: "10.0.0.1", type: "MIKROTIK" }];

// helper: transition rows as returned by $queryRaw (flat, with deviceId)
function rows(history: { isOnline: boolean; timestamp: Date }[]) {
  return history.map((h) => ({ deviceId: "device-1", isOnline: h.isOnline, timestamp: h.timestamp }));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.device.findMany.mockResolvedValue(DEVICE_META);
  mockDb.$queryRaw.mockResolvedValue([]);
});

describe("GET /api/incidents", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it("returns paginated envelope with empty data when no devices exist", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    mockDb.device.findMany.mockResolvedValue([]);
    mockDb.$queryRaw.mockResolvedValue([]);

    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(0);
    expect(body.total).toBe(0);
    expect(body.hasMore).toBe(false);
  });

  it("returns empty data when device has no history in window", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    mockDb.$queryRaw.mockResolvedValue([]);

    const res = await GET(makeReq());
    const body = await res.json();
    expect(body.data).toHaveLength(0);
  });

  it("detects a resolved incident from online→offline→online transitions", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const t1 = new Date("2024-01-01T10:00:00Z");
    const t2 = new Date("2024-01-01T10:05:00Z");
    const t3 = new Date("2024-01-01T10:10:00Z");

    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true,  timestamp: t1 },
      { isOnline: false, timestamp: t2 },
      { isOnline: true,  timestamp: t3 },
    ]));

    const res = await GET(makeReq());
    const { data } = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].resolved).toBe(true);
    expect(data[0].startAt).toBe(t2.toISOString());
    expect(data[0].endAt).toBe(t3.toISOString());
    expect(data[0].durationMs).toBe(t3.getTime() - t2.getTime());
    expect(data[0].deviceIp).toBe("10.0.0.1");
  });

  it("detects an open incident when last state is offline", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const t1 = new Date("2024-01-01T10:00:00Z");
    const t2 = new Date("2024-01-01T10:05:00Z");

    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true,  timestamp: t1 },
      { isOnline: false, timestamp: t2 },
    ]));

    const res = await GET(makeReq());
    const { data } = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].resolved).toBe(false);
    expect(data[0].endAt).toBeNull();
    expect(data[0].startAt).toBe(t2.toISOString());
  });

  it("treats first record offline as incident starting at window boundary", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const t1 = new Date("2024-01-01T10:00:00Z");
    const t2 = new Date("2024-01-01T10:30:00Z");

    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: false, timestamp: t1 },
      { isOnline: true,  timestamp: t2 },
    ]));

    const res = await GET(makeReq());
    const { data } = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].resolved).toBe(true);
    expect(data[0].endAt).toBe(t2.toISOString());
  });

  it("caps ?hours= at 720 (passes the right `since` to the transition query)", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    await GET(makeReq("?hours=9999"));

    // $queryRaw is a tagged template: call args are (strings, ...values); since is the first value
    const sinceArg: Date = mockDb.$queryRaw.mock.calls[0][1];
    const windowHours = (Date.now() - sinceArg.getTime()) / 3_600_000;
    expect(windowHours).toBeLessThanOrEqual(720 + 1);
  });

  it("returns incidents sorted by startAt descending", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const times = [
      new Date("2024-01-01T08:00:00Z"),
      new Date("2024-01-01T08:05:00Z"),
      new Date("2024-01-01T08:10:00Z"),
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-01T09:05:00Z"),
      new Date("2024-01-01T09:10:00Z"),
    ];

    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true,  timestamp: times[0] },
      { isOnline: false, timestamp: times[1] },
      { isOnline: true,  timestamp: times[2] },
      { isOnline: false, timestamp: times[3] },
      { isOnline: false, timestamp: times[4] },
      { isOnline: true,  timestamp: times[5] },
    ]));

    const res = await GET(makeReq());
    const { data } = await res.json();

    expect(data).toHaveLength(2);
    expect(new Date(data[0].startAt).getTime()).toBeGreaterThan(
      new Date(data[1].startAt).getTime()
    );
  });

  it("paginates results with page and limit params", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);

    const history: { isOnline: boolean; timestamp: Date }[] = [];
    const origin = new Date("2024-01-01T00:00:00Z").getTime();
    for (let i = 0; i < 30; i++) {
      const base = origin + i * 10 * 60_000;
      history.push({ isOnline: true,  timestamp: new Date(base) });
      history.push({ isOnline: false, timestamp: new Date(base + 60_000) });
      history.push({ isOnline: true,  timestamp: new Date(base + 120_000) });
    }
    mockDb.$queryRaw.mockResolvedValue(rows(history));

    const res1 = await GET(makeReq("?page=1&limit=10"));
    const body1 = await res1.json();
    expect(body1.data).toHaveLength(10);
    expect(body1.total).toBe(30);
    expect(body1.hasMore).toBe(true);
    expect(body1.page).toBe(1);

    mockDb.$queryRaw.mockResolvedValue(rows(history));
    const res2 = await GET(makeReq("?page=3&limit=10"));
    const body2 = await res2.json();
    expect(body2.data).toHaveLength(10);
    expect(body2.hasMore).toBe(false);
  });

  it("respects limit cap of 100", async () => {
    mockAuth.mockResolvedValue(FAKE_SESSION as never);
    mockDb.$queryRaw.mockResolvedValue([]);

    const res = await GET(makeReq("?limit=9999"));
    const body = await res.json();
    expect(body.limit).toBeLessThanOrEqual(100);
  });
});
