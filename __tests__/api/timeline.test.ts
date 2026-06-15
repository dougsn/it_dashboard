/**
 * @jest-environment node
 */
import { GET } from "@/app/api/timeline/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/db", () => ({
  db: {
    device: { findMany: jest.fn() },
    link:   { findMany: jest.fn() },
    $queryRaw: jest.fn(),
  },
}));

import { auth } from "@/lib/auth";
import { db }   from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb   = db   as unknown as {
  device: { findMany: jest.Mock };
  link: { findMany: jest.Mock };
  $queryRaw: jest.Mock;
};

const SESSION = { user: { id: "u1", name: "admin" }, expires: "2099-01-01" };

function makeReq(params = "") {
  return new NextRequest(`http://localhost/api/timeline${params}`);
}

const DEVICE_META = [{ id: "d1", name: "Router", ip: "10.0.0.1", type: "MIKROTIK", location: null }];

// flat transition rows as returned by the LAG query
function rows(history: { isOnline: boolean; pingMs?: number | null; timestamp: Date }[]) {
  return history.map((h) => ({ deviceId: "d1", isOnline: h.isOnline, pingMs: h.pingMs ?? null, timestamp: h.timestamp }));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(SESSION as never);
  mockDb.device.findMany.mockResolvedValue(DEVICE_META);
  mockDb.link.findMany.mockResolvedValue([]);
  mockDb.$queryRaw.mockResolvedValue([]);
});

describe("auth", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });
});

describe("device offline/online events", () => {
  it("emits DEVICE_OFFLINE on online→offline transition", async () => {
    const t1 = new Date("2026-01-01T10:00:00Z");
    const t2 = new Date("2026-01-01T10:05:00Z");
    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true,  pingMs: 10,   timestamp: t1 },
      { isOnline: false, pingMs: null, timestamp: t2 },
    ]));

    const res = await GET(makeReq());
    const events = await res.json();

    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe("DEVICE_OFFLINE");
    expect(events[0].timestamp).toBe(t2.toISOString());
    expect(events[0].entityId).toBe("d1");
    expect(events[0].ip).toBe("10.0.0.1");
  });

  it("emits DEVICE_ONLINE on offline→online recovery", async () => {
    const t1 = new Date("2026-01-01T10:00:00Z");
    const t2 = new Date("2026-01-01T10:05:00Z");
    const t3 = new Date("2026-01-01T10:10:00Z");
    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true,  pingMs: 10,   timestamp: t1 },
      { isOnline: false, pingMs: null, timestamp: t2 },
      { isOnline: true,  pingMs: 15,   timestamp: t3 },
    ]));

    const res = await GET(makeReq());
    const kinds = (await res.json()).map((e: { kind: string }) => e.kind);
    expect(kinds).toContain("DEVICE_OFFLINE");
    expect(kinds).toContain("DEVICE_ONLINE");
  });

  it("emits no events when device stays online (only first row in transitions)", async () => {
    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true, pingMs: 10, timestamp: new Date("2026-01-01T10:00:00Z") },
    ]));

    const res = await GET(makeReq());
    const events = await res.json();
    expect(events.filter((e: { kind: string }) => e.kind === "DEVICE_OFFLINE" || e.kind === "DEVICE_ONLINE")).toHaveLength(0);
  });

  it("emits no events when device has no rows in window", async () => {
    mockDb.$queryRaw.mockResolvedValue([]);
    const res = await GET(makeReq());
    expect(await res.json()).toHaveLength(0);
  });
});

describe("DEVICE_HIGH_LATENCY events", () => {
  it("emits DEVICE_HIGH_LATENCY when latency crosses 150ms threshold", async () => {
    const t1 = new Date("2026-01-01T10:00:00Z");
    const t2 = new Date("2026-01-01T10:01:00Z");
    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true, pingMs: 50,  timestamp: t1 },
      { isOnline: true, pingMs: 200, timestamp: t2 },
    ]));

    const res = await GET(makeReq());
    const latency = (await res.json()).find((e: { kind: string }) => e.kind === "DEVICE_HIGH_LATENCY");
    expect(latency).toBeDefined();
    expect(latency.value).toBe(200);
    expect(latency.timestamp).toBe(t2.toISOString());
  });

  it("emits DEVICE_HIGH_LATENCY only once per episode (the bucket-change row only)", async () => {
    // The LAG query collapses the still-high rows; only the rising-edge row is returned
    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true, pingMs: 50,  timestamp: new Date("2026-01-01T10:00:00Z") },
      { isOnline: true, pingMs: 200, timestamp: new Date("2026-01-01T10:01:00Z") },
    ]));

    const res = await GET(makeReq());
    const latencyEvents = (await res.json()).filter((e: { kind: string }) => e.kind === "DEVICE_HIGH_LATENCY");
    expect(latencyEvents).toHaveLength(1);
  });

  it("does not emit DEVICE_HIGH_LATENCY when device is offline", async () => {
    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true,  pingMs: 10,   timestamp: new Date("2026-01-01T10:00:00Z") },
      { isOnline: false, pingMs: null, timestamp: new Date("2026-01-01T10:01:00Z") },
    ]));

    const res = await GET(makeReq());
    const events = await res.json();
    expect(events.find((e: { kind: string }) => e.kind === "DEVICE_HIGH_LATENCY")).toBeUndefined();
  });
});

describe("link events", () => {
  it("emits LINK_DOWN for DOWN webhook events", async () => {
    const ts = new Date("2026-01-01T12:00:00Z");
    mockDb.link.findMany.mockResolvedValue([{
      id: "l1", name: "Fibra SP", location: "São Paulo",
      events: [{ id: "ev1", type: "DOWN", timestamp: ts }],
    }]);

    const res = await GET(makeReq());
    const linkEv = (await res.json()).find((e: { kind: string }) => e.kind === "LINK_DOWN");
    expect(linkEv).toBeDefined();
    expect(linkEv.entityType).toBe("LINK");
    expect(linkEv.location).toBe("São Paulo");
    expect(linkEv.timestamp).toBe(ts.toISOString());
  });

  it("emits LINK_UP for UP webhook events", async () => {
    mockDb.link.findMany.mockResolvedValue([{
      id: "l1", name: "Fibra SP", location: null,
      events: [{ id: "ev2", type: "UP", timestamp: new Date("2026-01-01T12:05:00Z") }],
    }]);

    const res = await GET(makeReq());
    expect((await res.json())[0].kind).toBe("LINK_UP");
  });
});

describe("sorting and params", () => {
  it("returns events sorted by timestamp descending", async () => {
    mockDb.$queryRaw.mockResolvedValue(rows([
      { isOnline: true,  pingMs: 10,   timestamp: new Date("2026-01-01T10:00:00Z") },
      { isOnline: false, pingMs: null, timestamp: new Date("2026-01-01T10:05:00Z") },
      { isOnline: true,  pingMs: 12,   timestamp: new Date("2026-01-01T10:10:00Z") },
    ]));

    const res = await GET(makeReq());
    const events = await res.json();
    for (let i = 1; i < events.length; i++) {
      expect(new Date(events[i - 1].timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(events[i].timestamp).getTime()
      );
    }
  });

  it("falls back to 24h when ?hours=abc (NaN guard)", async () => {
    await GET(makeReq("?hours=abc"));
    const since: Date = mockDb.$queryRaw.mock.calls[0][2];
    const windowHours = (Date.now() - since.getTime()) / 3_600_000;
    expect(windowHours).toBeGreaterThan(23);
    expect(windowHours).toBeLessThan(25);
  });

  it("caps ?hours= at 168", async () => {
    await GET(makeReq("?hours=9999"));
    const since: Date = mockDb.$queryRaw.mock.calls[0][2];
    const windowHours = (Date.now() - since.getTime()) / 3_600_000;
    expect(windowHours).toBeLessThanOrEqual(169);
  });
});
