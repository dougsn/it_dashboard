/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/db", () => ({
  db: {
    device:        { findUnique: jest.fn() },
    statusHistory: { findMany: jest.fn() },
  },
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/reports/route";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb   = db   as jest.Mocked<typeof db>;

const SESSION  = { user: { id: "u1", name: "admin" }, expires: "2099-01-01" };
const DEV_ID   = "dev-001";

const fakeDevice = {
  id: DEV_ID, name: "Router", type: "MIKROTIK" as const, ip: "10.0.0.1", location: "Rack A",
  currentStatus: { isOnline: true, pingMs: 12, unifiData: null, omadaData: null } as unknown as null,
};

function makeHistory(entries: { isOnline: boolean; pingMs?: number | null; cpuLoad?: number | null; memoryUsed?: number | null; tsOffset?: number }[]) {
  const base = Date.now() - 3_600_000;
  return entries.map((e, i) => ({
    isOnline: e.isOnline,
    pingMs: e.pingMs ?? null,
    cpuLoad: e.cpuLoad ?? null,
    memoryUsed: e.memoryUsed ?? null,
    timestamp: new Date(base + i * 60_000 + (e.tsOffset ?? 0)),
  }));
}

function req(params = `devices=${DEV_ID}&hours=24`) {
  return new NextRequest(`http://localhost/api/reports?${params}`);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(SESSION as never);
  (mockDb.device.findUnique as jest.Mock).mockResolvedValue(fakeDevice);
  (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue([]);
});

// ── Auth ──────────────────────────────────────────────────────────────────────

describe("GET /api/reports — auth", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET(req());
    expect(res.status).toBe(401);
  });
});

// ── Input validation ──────────────────────────────────────────────────────────

describe("GET /api/reports — input validation", () => {
  it("returns 400 when devices param is empty", async () => {
    const res = await GET(req("devices=&hours=24"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/dispositivo/i);
  });

  it("returns 400 when more than 10 devices are requested", async () => {
    const ids = Array.from({ length: 11 }, (_, i) => `dev-${i}`).join(",");
    const res = await GET(req(`devices=${ids}`));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/máximo/i);
  });
});

// ── Report content ────────────────────────────────────────────────────────────

describe("GET /api/reports — report content", () => {
  it("returns empty array when device is not found", async () => {
    (mockDb.device.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(0);
  });

  it("returns 100% uptime when all checks are online", async () => {
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(
      makeHistory([{ isOnline: true, pingMs: 10 }, { isOnline: true, pingMs: 20 }])
    );
    const res = await GET(req());
    const [report] = await res.json();
    expect(report.summary.uptimePct).toBe(100);
    expect(report.summary.totalChecks).toBe(2);
    expect(report.summary.onlineChecks).toBe(2);
    expect(report.summary.avgPingMs).toBe(15);
  });

  it("calculates uptime and downtime correctly for mixed history", async () => {
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(
      makeHistory([
        { isOnline: true }, { isOnline: true }, { isOnline: false }, { isOnline: false }, { isOnline: true },
      ])
    );
    const res = await GET(req());
    const [report] = await res.json();
    expect(report.summary.uptimePct).toBeCloseTo(60);
    expect(report.summary.incidentCount).toBe(1);
    expect(report.incidents[0].resolved).toBe(true);
  });

  it("reports open incident when device is still offline at end of history", async () => {
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(
      makeHistory([{ isOnline: true }, { isOnline: false }, { isOnline: false }])
    );
    const res = await GET(req());
    const [report] = await res.json();
    expect(report.incidents[0].resolved).toBe(false);
    expect(report.incidents[0].endAt).toBeNull();
  });

  it("computes ping stats (avg/min/max) for online checks only", async () => {
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(
      makeHistory([
        { isOnline: true, pingMs: 10 },
        { isOnline: false, pingMs: null },
        { isOnline: true, pingMs: 30 },
      ])
    );
    const res = await GET(req());
    const [report] = await res.json();
    expect(report.summary.avgPingMs).toBe(20);
    expect(report.summary.minPingMs).toBe(10);
    expect(report.summary.maxPingMs).toBe(30);
  });

  it("returns routerosHistory for MIKROTIK device", async () => {
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(
      makeHistory([{ isOnline: true, cpuLoad: 20, memoryUsed: 40 }])
    );
    const res = await GET(req());
    const [report] = await res.json();
    expect(report.routerosHistory).not.toBeNull();
    expect(report.routerosHistory[0].cpuLoad).toBe(20);
  });

  it("returns null routerosHistory for non-MIKROTIK device", async () => {
    (mockDb.device.findUnique as jest.Mock).mockResolvedValue({ ...fakeDevice, type: "DVR" });
    const res = await GET(req());
    const [report] = await res.json();
    expect(report.routerosHistory).toBeNull();
  });

  it("returns device metadata in the report", async () => {
    const res = await GET(req());
    const [report] = await res.json();
    expect(report.device.name).toBe("Router");
    expect(report.device.ip).toBe("10.0.0.1");
    expect(report.device.type).toBe("MIKROTIK");
  });

  it("returns 200 with report for zero history (no checks yet)", async () => {
    const res = await GET(req());
    const [report] = await res.json();
    expect(res.status).toBe(200);
    expect(report.summary.uptimePct).toBe(100);
    expect(report.summary.totalChecks).toBe(0);
  });
});

// ── Insights ──────────────────────────────────────────────────────────────────

describe("GET /api/reports — insights", () => {
  it("generates ok uptime insight when uptime >= 99.5%", async () => {
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(
      makeHistory(Array.from({ length: 200 }, () => ({ isOnline: true, pingMs: 10 })))
    );
    const res = await GET(req());
    const [report] = await res.json();
    const uptimeInsight = report.insights.find((i: { text: string }) => i.text.includes("Uptime"));
    expect(uptimeInsight?.level).toBe("ok");
  });

  it("generates critical uptime insight when uptime < 95%", async () => {
    const history = makeHistory([
      ...Array.from({ length: 3 }, () => ({ isOnline: true })),
      ...Array.from({ length: 7 }, () => ({ isOnline: false })),
    ]);
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(history);
    const res = await GET(req());
    const [report] = await res.json();
    const uptimeInsight = report.insights.find((i: { text: string }) => i.text.includes("crítico"));
    expect(uptimeInsight?.level).toBe("critical");
  });

  it("generates critical ping insight when avg ping > 150ms", async () => {
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(
      makeHistory([{ isOnline: true, pingMs: 200 }, { isOnline: true, pingMs: 300 }])
    );
    const res = await GET(req());
    const [report] = await res.json();
    const pingInsight = report.insights.find((i: { text: string }) => i.text.includes("crítica") || i.text.includes("latência"));
    expect(pingInsight?.level).toBe("critical");
  });

  it("generates critical CPU insight when avg CPU > 70%", async () => {
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(
      makeHistory([{ isOnline: true, cpuLoad: 85 }, { isOnline: true, cpuLoad: 90 }])
    );
    const res = await GET(req());
    const [report] = await res.json();
    const cpuInsight = report.insights.find((i: { text: string }) => i.text.toLowerCase().includes("cpu"));
    expect(cpuInsight?.level).toBe("critical");
  });

  it("generates ok memory insight when avg memory <= 60%", async () => {
    (mockDb.statusHistory.findMany as jest.Mock).mockResolvedValue(
      makeHistory([{ isOnline: true, memoryUsed: 30 }, { isOnline: true, memoryUsed: 40 }])
    );
    const res = await GET(req());
    const [report] = await res.json();
    const memInsight = report.insights.find((i: { text: string }) => i.text.toLowerCase().includes("memória"));
    expect(memInsight?.level).toBe("ok");
  });
});

// ── Multi-device ──────────────────────────────────────────────────────────────

describe("GET /api/reports — multi-device", () => {
  it("returns one report per valid device ID", async () => {
    (mockDb.device.findUnique as jest.Mock).mockResolvedValue(fakeDevice);
    const res = await GET(req(`devices=${DEV_ID},dev-002&hours=24`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });

  it("uses default 168h when hours param is missing", async () => {
    const res = await GET(req(`devices=${DEV_ID}`));
    const [report] = await res.json();
    expect(report.period.hours).toBe(168);
  });

  it("clamps hours to 720", async () => {
    const res = await GET(req(`devices=${DEV_ID}&hours=9999`));
    const [report] = await res.json();
    expect(report.period.hours).toBe(720);
  });
});
