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
  },
}));

import { auth } from "@/lib/auth";
import { db }   from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb   = db   as jest.Mocked<typeof db>;

const SESSION = { user: { id: "u1", name: "admin" }, expires: "2099-01-01" };

function makeReq(params = "") {
  return new NextRequest(`http://localhost/api/timeline${params}`);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(SESSION as never);
  (mockDb.device.findMany as jest.Mock).mockResolvedValue([]);
  (mockDb.link.findMany   as jest.Mock).mockResolvedValue([]);
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe("auth", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });
});

// ─── Device events ────────────────────────────────────────────────────────────

describe("device offline/online events", () => {
  it("emits DEVICE_OFFLINE on online→offline transition", async () => {
    const t1 = new Date("2026-01-01T10:00:00Z");
    const t2 = new Date("2026-01-01T10:05:00Z");

    (mockDb.device.findMany as jest.Mock).mockResolvedValue([{
      id: "d1", name: "Router", type: "MIKROTIK", location: null,
      history: [
        { isOnline: true,  pingMs: 10, timestamp: t1 },
        { isOnline: false, pingMs: null, timestamp: t2 },
      ],
    }]);

    const res = await GET(makeReq());
    const events = await res.json();

    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe("DEVICE_OFFLINE");
    expect(events[0].timestamp).toBe(t2.toISOString());
    expect(events[0].entityId).toBe("d1");
  });

  it("emits DEVICE_ONLINE on offline→online recovery", async () => {
    const t1 = new Date("2026-01-01T10:00:00Z");
    const t2 = new Date("2026-01-01T10:05:00Z");
    const t3 = new Date("2026-01-01T10:10:00Z");

    (mockDb.device.findMany as jest.Mock).mockResolvedValue([{
      id: "d1", name: "Router", type: "MIKROTIK", location: null,
      history: [
        { isOnline: true,  pingMs: 10,   timestamp: t1 },
        { isOnline: false, pingMs: null, timestamp: t2 },
        { isOnline: true,  pingMs: 15,   timestamp: t3 },
      ],
    }]);

    const res = await GET(makeReq());
    const events = await res.json();
    const kinds = events.map((e: { kind: string }) => e.kind);

    expect(kinds).toContain("DEVICE_OFFLINE");
    expect(kinds).toContain("DEVICE_ONLINE");
  });

  it("emits no events when device stays online", async () => {
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([{
      id: "d1", name: "Router", type: "MIKROTIK", location: null,
      history: [
        { isOnline: true, pingMs: 10, timestamp: new Date("2026-01-01T10:00:00Z") },
        { isOnline: true, pingMs: 12, timestamp: new Date("2026-01-01T10:01:00Z") },
      ],
    }]);

    const res = await GET(makeReq());
    const events = await res.json();

    expect(events.filter((e: { kind: string }) => e.kind.startsWith("DEVICE_OFFLINE") || e.kind === "DEVICE_ONLINE")).toHaveLength(0);
  });

  it("emits no events when device history is empty", async () => {
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([{
      id: "d1", name: "Router", type: "MIKROTIK", location: null,
      history: [],
    }]);

    const res = await GET(makeReq());
    expect(await res.json()).toHaveLength(0);
  });
});

// ─── High latency events ──────────────────────────────────────────────────────

describe("DEVICE_HIGH_LATENCY events", () => {
  it("emits DEVICE_HIGH_LATENCY when latency crosses 150ms threshold", async () => {
    const t1 = new Date("2026-01-01T10:00:00Z");
    const t2 = new Date("2026-01-01T10:01:00Z");

    (mockDb.device.findMany as jest.Mock).mockResolvedValue([{
      id: "d1", name: "Router", type: "MIKROTIK", location: null,
      history: [
        { isOnline: true, pingMs: 50,  timestamp: t1 },
        { isOnline: true, pingMs: 200, timestamp: t2 },
      ],
    }]);

    const res = await GET(makeReq());
    const events = await res.json();
    const latency = events.find((e: { kind: string }) => e.kind === "DEVICE_HIGH_LATENCY");

    expect(latency).toBeDefined();
    expect(latency.value).toBe(200);
    expect(latency.timestamp).toBe(t2.toISOString());
  });

  it("emits DEVICE_HIGH_LATENCY only once per high-latency episode (not on every tick)", async () => {
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([{
      id: "d1", name: "Router", type: "MIKROTIK", location: null,
      history: [
        { isOnline: true, pingMs: 50,  timestamp: new Date("2026-01-01T10:00:00Z") },
        { isOnline: true, pingMs: 200, timestamp: new Date("2026-01-01T10:01:00Z") }, // crosses threshold
        { isOnline: true, pingMs: 300, timestamp: new Date("2026-01-01T10:02:00Z") }, // still high — no new event
        { isOnline: true, pingMs: 400, timestamp: new Date("2026-01-01T10:03:00Z") }, // still high — no new event
      ],
    }]);

    const res = await GET(makeReq());
    const events = await res.json();
    const latencyEvents = events.filter((e: { kind: string }) => e.kind === "DEVICE_HIGH_LATENCY");

    expect(latencyEvents).toHaveLength(1);
  });

  it("does not emit DEVICE_HIGH_LATENCY when device is offline", async () => {
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([{
      id: "d1", name: "Router", type: "MIKROTIK", location: null,
      history: [
        { isOnline: true,  pingMs: 10,   timestamp: new Date("2026-01-01T10:00:00Z") },
        { isOnline: false, pingMs: null, timestamp: new Date("2026-01-01T10:01:00Z") },
        { isOnline: false, pingMs: 999,  timestamp: new Date("2026-01-01T10:02:00Z") }, // offline, high ping — ignore
      ],
    }]);

    const res = await GET(makeReq());
    const events = await res.json();

    expect(events.find((e: { kind: string }) => e.kind === "DEVICE_HIGH_LATENCY")).toBeUndefined();
  });
});

// ─── Link events ──────────────────────────────────────────────────────────────

describe("link events", () => {
  it("emits LINK_DOWN for DOWN webhook events", async () => {
    const ts = new Date("2026-01-01T12:00:00Z");

    (mockDb.link.findMany as jest.Mock).mockResolvedValue([{
      id: "l1", name: "Fibra SP", location: "São Paulo",
      events: [{ id: "ev1", type: "DOWN", timestamp: ts }],
    }]);

    const res = await GET(makeReq());
    const events = await res.json();
    const linkEv = events.find((e: { kind: string }) => e.kind === "LINK_DOWN");

    expect(linkEv).toBeDefined();
    expect(linkEv.entityType).toBe("LINK");
    expect(linkEv.location).toBe("São Paulo");
    expect(linkEv.timestamp).toBe(ts.toISOString());
  });

  it("emits LINK_UP for UP webhook events", async () => {
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([{
      id: "l1", name: "Fibra SP", location: null,
      events: [{ id: "ev2", type: "UP", timestamp: new Date("2026-01-01T12:05:00Z") }],
    }]);

    const res = await GET(makeReq());
    const events = await res.json();

    expect(events[0].kind).toBe("LINK_UP");
  });
});

// ─── Sorting & query params ───────────────────────────────────────────────────

describe("sorting and params", () => {
  it("returns events sorted by timestamp descending", async () => {
    const t1 = new Date("2026-01-01T10:00:00Z");
    const t2 = new Date("2026-01-01T10:05:00Z");
    const t3 = new Date("2026-01-01T10:10:00Z");

    (mockDb.device.findMany as jest.Mock).mockResolvedValue([{
      id: "d1", name: "R1", type: "MIKROTIK", location: null,
      history: [
        { isOnline: true,  pingMs: 10,   timestamp: t1 },
        { isOnline: false, pingMs: null, timestamp: t2 },
        { isOnline: true,  pingMs: 12,   timestamp: t3 },
      ],
    }]);

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

    const callArgs = (mockDb.device.findMany as jest.Mock).mock.calls[0][0];
    const since: Date = callArgs.select.history.where.timestamp.gte;
    const windowHours = (Date.now() - since.getTime()) / 3_600_000;
    expect(windowHours).toBeGreaterThan(23);
    expect(windowHours).toBeLessThan(25);
  });

  it("caps ?hours= at 168", async () => {
    await GET(makeReq("?hours=9999"));

    const callArgs = (mockDb.device.findMany as jest.Mock).mock.calls[0][0];
    const since: Date = callArgs.select.history.where.timestamp.gte;
    const windowHours = (Date.now() - since.getTime()) / 3_600_000;
    expect(windowHours).toBeLessThanOrEqual(169);
  });
});
