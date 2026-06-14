/**
 * @jest-environment node
 *
 * The heavy aggregation moved to SQL (lib/report-queries + lib/incident-detection),
 * validated by integration tests. These unit tests mock those query functions and
 * cover the orchestration + the pure logic (buildIncidents, buildInsights) in
 * lib/report-builder.
 */
jest.mock("@/lib/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/db", () => ({ db: { device: { findUnique: jest.fn() } } }));
jest.mock("@/lib/report-queries", () => ({
  getDeviceReportStats: jest.fn(),
  getDeviceChartSamples: jest.fn(),
}));
jest.mock("@/lib/incident-detection", () => ({
  getOnlineTransitionsForDevice: jest.fn(),
}));

import { NextRequest } from "next/server";
import { GET } from "@/app/api/reports/route";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDeviceReportStats, getDeviceChartSamples } from "@/lib/report-queries";
import { getOnlineTransitionsForDevice } from "@/lib/incident-detection";

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockDb   = db as unknown as { device: { findUnique: jest.Mock } };
const mockStats   = getDeviceReportStats as jest.Mock;
const mockSamples = getDeviceChartSamples as jest.Mock;
const mockTrans   = getOnlineTransitionsForDevice as jest.Mock;

const SESSION = { user: { id: "u1", name: "admin" }, expires: "2099-01-01" };
const DEV_ID  = "dev-001";

const fakeDevice = {
  id: DEV_ID, name: "Router", type: "MIKROTIK" as const, ip: "10.0.0.1", location: "Rack A",
  currentStatus: { isOnline: true, pingMs: 12, unifiData: null, omadaData: null } as unknown as null,
};

const zeroStats = {
  total: 0, online: 0, avgPing: null, minPing: null, maxPing: null,
  avgCpu: null, cpuCount: 0, highCpu: 0, avgMem: null, memCount: 0,
};

function req(params = `devices=${DEV_ID}&hours=24`) {
  return new NextRequest(`http://localhost/api/reports?${params}`);
}
const ts = (m: number) => new Date(Date.now() - 3_600_000 + m * 60_000);

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.mockResolvedValue(SESSION as never);
  mockDb.device.findUnique.mockResolvedValue(fakeDevice);
  mockStats.mockResolvedValue(zeroStats);
  mockSamples.mockResolvedValue([]);
  mockTrans.mockResolvedValue([]);
});

describe("GET /api/reports — auth & validation", () => {
  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    expect((await GET(req())).status).toBe(401);
  });
  it("returns 400 when devices param is empty", async () => {
    const res = await GET(req("devices=&hours=24"));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/dispositivo/i);
  });
  it("returns 400 when more than 10 devices are requested", async () => {
    const ids = Array.from({ length: 11 }, (_, i) => `dev-${i}`).join(",");
    const res = await GET(req(`devices=${ids}`));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/máximo/i);
  });
});

describe("GET /api/reports — summary", () => {
  it("returns empty array when device is not found", async () => {
    mockDb.device.findUnique.mockResolvedValue(null);
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(0);
  });

  it("computes uptime and avg ping from the stats", async () => {
    mockStats.mockResolvedValue({ ...zeroStats, total: 2, online: 2, avgPing: 15, minPing: 10, maxPing: 20 });
    const [report] = await (await GET(req())).json();
    expect(report.summary.uptimePct).toBe(100);
    expect(report.summary.totalChecks).toBe(2);
    expect(report.summary.onlineChecks).toBe(2);
    expect(report.summary.avgPingMs).toBe(15);
  });

  it("rounds the average ping", async () => {
    mockStats.mockResolvedValue({ ...zeroStats, total: 3, online: 3, avgPing: 20.4, minPing: 10, maxPing: 30 });
    const [report] = await (await GET(req())).json();
    expect(report.summary.avgPingMs).toBe(20);
    expect(report.summary.minPingMs).toBe(10);
    expect(report.summary.maxPingMs).toBe(30);
  });

  it("detects a resolved incident from the transition rows", async () => {
    mockStats.mockResolvedValue({ ...zeroStats, total: 5, online: 3 });
    mockTrans.mockResolvedValue([
      { deviceId: DEV_ID, isOnline: true,  timestamp: ts(0) },
      { deviceId: DEV_ID, isOnline: false, timestamp: ts(2) },
      { deviceId: DEV_ID, isOnline: true,  timestamp: ts(4) },
    ]);
    const [report] = await (await GET(req())).json();
    expect(report.summary.uptimePct).toBeCloseTo(60);
    expect(report.summary.incidentCount).toBe(1);
    expect(report.incidents[0].resolved).toBe(true);
  });

  it("reports an open incident when last transition is offline", async () => {
    mockTrans.mockResolvedValue([
      { deviceId: DEV_ID, isOnline: true,  timestamp: ts(0) },
      { deviceId: DEV_ID, isOnline: false, timestamp: ts(2) },
    ]);
    const [report] = await (await GET(req())).json();
    expect(report.incidents[0].resolved).toBe(false);
    expect(report.incidents[0].endAt).toBeNull();
  });

  it("returns 200 with 100% uptime for zero history", async () => {
    const res = await GET(req());
    const [report] = await res.json();
    expect(res.status).toBe(200);
    expect(report.summary.uptimePct).toBe(100);
    expect(report.summary.totalChecks).toBe(0);
  });
});

describe("GET /api/reports — charts & metadata", () => {
  it("returns routerosHistory from samples for a MIKROTIK device", async () => {
    mockSamples.mockResolvedValue([
      { isOnline: true, pingMs: 10, cpuLoad: 20, memoryUsed: 40, timestamp: ts(0) },
    ]);
    const [report] = await (await GET(req())).json();
    expect(report.routerosHistory).not.toBeNull();
    expect(report.routerosHistory[0].cpuLoad).toBe(20);
    expect(report.pingHistory[0].pingMs).toBe(10);
  });

  it("returns null routerosHistory for a non-MIKROTIK device", async () => {
    mockDb.device.findUnique.mockResolvedValue({ ...fakeDevice, type: "DVR" });
    const [report] = await (await GET(req())).json();
    expect(report.routerosHistory).toBeNull();
  });

  it("returns device metadata", async () => {
    const [report] = await (await GET(req())).json();
    expect(report.device.name).toBe("Router");
    expect(report.device.ip).toBe("10.0.0.1");
    expect(report.device.type).toBe("MIKROTIK");
  });
});

describe("GET /api/reports — insights (from exact metrics)", () => {
  it("ok uptime insight when uptime >= 99.5%", async () => {
    mockStats.mockResolvedValue({ ...zeroStats, total: 200, online: 200, avgPing: 10, minPing: 10, maxPing: 10 });
    const [report] = await (await GET(req())).json();
    const i = report.insights.find((x: { text: string }) => x.text.includes("Uptime"));
    expect(i?.level).toBe("ok");
  });

  it("critical uptime insight when uptime < 95%", async () => {
    mockStats.mockResolvedValue({ ...zeroStats, total: 10, online: 3 });
    const [report] = await (await GET(req())).json();
    const i = report.insights.find((x: { text: string }) => x.text.includes("crítico"));
    expect(i?.level).toBe("critical");
  });

  it("critical ping insight when avg ping > 150ms", async () => {
    mockStats.mockResolvedValue({ ...zeroStats, total: 2, online: 2, avgPing: 250, minPing: 200, maxPing: 300 });
    const [report] = await (await GET(req())).json();
    const i = report.insights.find((x: { text: string }) => x.text.includes("crítica") || x.text.includes("latência"));
    expect(i?.level).toBe("critical");
  });

  it("critical CPU insight when avg CPU > 70%", async () => {
    mockStats.mockResolvedValue({ ...zeroStats, total: 2, online: 2, avgCpu: 87.5, cpuCount: 2, highCpu: 2 });
    const [report] = await (await GET(req())).json();
    const i = report.insights.find((x: { text: string }) => x.text.toLowerCase().includes("cpu"));
    expect(i?.level).toBe("critical");
  });

  it("ok memory insight when avg memory <= 60%", async () => {
    mockStats.mockResolvedValue({ ...zeroStats, total: 2, online: 2, avgMem: 35, memCount: 2 });
    const [report] = await (await GET(req())).json();
    const i = report.insights.find((x: { text: string }) => x.text.toLowerCase().includes("memória"));
    expect(i?.level).toBe("ok");
  });
});

describe("GET /api/reports — multi-device & params", () => {
  it("returns one report per valid device ID", async () => {
    const res = await GET(req(`devices=${DEV_ID},dev-002&hours=24`));
    expect((await res.json())).toHaveLength(2);
  });
  it("uses default 168h when hours param is missing", async () => {
    const [report] = await (await GET(req(`devices=${DEV_ID}`))).json();
    expect(report.period.hours).toBe(168);
  });
  it("clamps hours to 720", async () => {
    const [report] = await (await GET(req(`devices=${DEV_ID}&hours=9999`))).json();
    expect(report.period.hours).toBe(720);
  });
});
