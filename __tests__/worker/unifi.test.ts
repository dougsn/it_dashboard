/**
 * @jest-environment node
 */

jest.mock("https", () => ({ request: jest.fn() }));

import * as https from "https";
import { checkUnifi } from "@/worker/monitors/unifi";

const mockRequest = https.request as jest.Mock;

// Build a fake IncomingMessage-style response
function fakeRes(statusCode: number, body: unknown, cookies: string[] = []) {
  const raw = JSON.stringify(body);
  const listeners: Record<string, ((...a: unknown[]) => void)[]> = {};
  const res = {
    statusCode,
    headers: { "set-cookie": cookies },
    on(ev: string, cb: (...a: unknown[]) => void) { (listeners[ev] ??= []).push(cb); return res; },
    _flush() { (listeners["data"] ?? []).forEach((cb) => cb(raw)); (listeners["end"] ?? []).forEach((cb) => cb()); },
  };
  return res;
}

// Build a fake ClientRequest
function fakeReq() {
  return { on: jest.fn().mockReturnThis(), setTimeout: jest.fn().mockReturnThis(), write: jest.fn(), end: jest.fn(), destroy: jest.fn() };
}

// Mock https.request to return responses from a queue, delivering them via setImmediate
function mockQueue(responses: ReturnType<typeof fakeRes>[]) {
  let idx = 0;
  mockRequest.mockImplementation((_opts: unknown, cb: (r: ReturnType<typeof fakeRes>) => void) => {
    const req = fakeReq();
    const res = responses[idx++];
    setImmediate(() => { cb(res); res._flush(); });
    return req;
  });
}

// Make setTimeout resolve immediately for the 1-second sampling delay
let timeoutSpy: jest.SpyInstance;
beforeEach(() => {
  jest.clearAllMocks();
  timeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((fn) => {
    if (typeof fn === "function") Promise.resolve().then(() => fn());
    return 0 as unknown as NodeJS.Timeout;
  });
});
afterEach(() => timeoutSpy.mockRestore());

// ── Integration API (API Key) ──────────────────────────────────────────────────

describe("checkUnifi — API key path", () => {
  const apIp = "192.168.1.10";
  const ctrl = "192.168.1.200";
  const auth = { method: "apikey" as const, apiKey: "key-abc" };

  it("returns model, uptime, CPU, memory and clients on success", async () => {
    mockQueue([
      fakeRes(200, { data: [{ id: "site-1", name: "default", internalReference: "default" }] }), // discover
      fakeRes(200, { data: [{ id: "site-1", name: "default", internalReference: "default" }] }), // sites
      fakeRes(200, { data: [{ id: "dev-1", macAddress: "aa:bb", model: "U6-Lite", firmwareVersion: "6.5", ipAddress: apIp }] }),
      fakeRes(200, { uptimeSec: 3600, cpuUtilizationPct: 25, memoryUtilizationPct: 50, uplink: { txRateBps: 1000, rxRateBps: 2000 } }),
      fakeRes(200, { data: [{ id: "c1", type: "WIRELESS", uplinkDeviceId: "dev-1", name: "Phone", macAddress: "11:22", ipAddress: "192.168.1.50", connectedAt: "2026-01-01T00:00:00Z" }] }),
      fakeRes(200, { data: [{ id: "b1", name: "HomeSSID", enabled: true, broadcastingFrequenciesGHz: [2.4, 5] }] }),
    ]);

    const r = await checkUnifi(apIp, ctrl, auth, 443, "default", false);

    expect(r.model).toBe("U6-Lite");
    expect(r.uptime).toBe(3600);
    expect(r.cpuLoad).toBe(25);
    expect(r.memoryUsed).toBe(50);
    expect(r.uplinkTxBps).toBe(1000);
    expect(r.uplinkRxBps).toBe(2000);
    expect(r.totalClients).toBe(1);
    expect(r.clients[0].name).toBe("Phone");
    expect(r.clients[0].signal).toBeNull();
    expect(r.clients[0].ssid).toBeNull();
    expect(r.ssids[0].ssid).toBe("HomeSSID");
    expect(r.ssids[0].band).toBe("2.4 GHz / 5 GHz");
  });

  it("throws when API key is rejected (HTTP 401)", async () => {
    mockQueue([fakeRes(401, {})]);
    await expect(checkUnifi(apIp, ctrl, auth, 443, "default", false)).rejects.toThrow(/inválida|permissão/i);
  });

  it("throws when AP IP not found in device list", async () => {
    // Must have 0 or 2+ devices — a single device triggers the single-device fallback
    mockQueue([
      fakeRes(200, { data: [{ id: "site-1", name: "default", internalReference: "default" }] }),
      fakeRes(200, { data: [{ id: "site-1", name: "default", internalReference: "default" }] }),
      fakeRes(200, { data: [] }), // no devices at all
    ]);
    await expect(checkUnifi(apIp, ctrl, auth, 443, "default", false)).rejects.toThrow(/não encontrado/i);
  });
});

// ── Inform API (user/pass) ────────────────────────────────────────────────────

describe("checkUnifi — Inform API (user/pass)", () => {
  const apIp = "192.168.1.10";
  const ctrl = "192.168.1.200";
  const auth = { method: "userpass" as const, username: "admin", password: "secret" };

  const apDevice = {
    mac: "aa:bb:cc:dd:ee:ff",
    ip: apIp,
    model: "UAP-AC-Lite",
    version: "5.43.52",
    uptime: 7200,
    "sys_stats": { cpu: 15.5, mem_used: 128_000_000, mem_total: 256_000_000 },
    tx_bytes: 1_000_000,
    rx_bytes: 2_000_000,
    vap_table: [
      { essid: "HomeNet", radio: "ng", channel: 6,  num_sta: 2, tx_bytes: 500_000, rx_bytes: 800_000, up: true },
      { essid: "HomeNet", radio: "na", channel: 36, num_sta: 1, tx_bytes: 200_000, rx_bytes: 400_000, up: true },
    ],
  };

  const staList = [
    { mac: "11:22:33:44:55:66", hostname: "Phone",  ip: "192.168.1.51", signal: -55, essid: "HomeNet", ap_mac: "aa:bb:cc:dd:ee:ff", last_seen: 1_700_000_000 },
    { mac: "aa:bb:cc:11:22:33", hostname: "Laptop", ip: "192.168.1.52", signal: -82, essid: "HomeNet", ap_mac: "aa:bb:cc:dd:ee:ff", last_seen: 1_700_000_000 },
  ];

  function setup(snap2TxBytes = 1_001_000, snap2RxBytes = 2_002_000) {
    mockQueue([
      fakeRes(200, { csrf: "csrf-xyz" }, ["TOKEN=tok1; Path=/"]),           // POST /api/auth/login
      fakeRes(200, { data: [apDevice] }),                                    // GET stat/device snap1
      fakeRes(200, { data: staList }),                                       // GET stat/sta
      fakeRes(200, { data: [{ ...apDevice, tx_bytes: snap2TxBytes, rx_bytes: snap2RxBytes }] }), // snap2
    ]);
  }

  it("returns model, firmware, CPU, memory and clients with signal/SSID", async () => {
    setup();
    const r = await checkUnifi(apIp, ctrl, auth, 443, "default", false);

    expect(r.model).toBe("UAP-AC-Lite");
    expect(r.firmware).toBe("5.43.52");
    expect(r.uptime).toBe(7200);
    expect(r.cpuLoad).toBeCloseTo(15.5);
    expect(r.memoryUsed).toBeCloseTo(50);
    expect(r.totalClients).toBe(2);
    expect(r.clients[0].signal).toBe(-55);
    expect(r.clients[0].ssid).toBe("HomeNet");
    expect(r.clients[1].signal).toBe(-82);
  });

  it("builds SSIDs from vap_table with correct band and channel", async () => {
    setup();
    const r = await checkUnifi(apIp, ctrl, auth, 443, "default", false);

    expect(r.ssids).toHaveLength(2);
    expect(r.ssids[0]).toMatchObject({ ssid: "HomeNet", band: "2.4 GHz", channel: 6,  clients: 2 });
    expect(r.ssids[1]).toMatchObject({ ssid: "HomeNet", band: "5 GHz",   channel: 36, clients: 1 });
  });

  it("computes uplinkTxBps and uplinkRxBps from two snapshots", async () => {
    setup(1_000_125, 2_000_250); // Δtx=125 Δrx=250 bytes in ~1s
    const r = await checkUnifi(apIp, ctrl, auth, 443, "default", false);

    expect(r.uplinkTxBps).toBe(125 * 8);
    expect(r.uplinkRxBps).toBe(250 * 8);
  });

  it("sends X-CSRF-Token header on all requests after login", async () => {
    setup();
    await checkUnifi(apIp, ctrl, auth, 443, "default", false);

    const calls = mockRequest.mock.calls;
    // calls[0] = login (no CSRF yet); calls[1..] should include it
    for (let i = 1; i < calls.length; i++) {
      const opts = calls[i][0] as { headers?: Record<string, string> };
      expect(opts.headers?.["X-CSRF-Token"]).toBe("csrf-xyz");
    }
  });

  it("falls back through login candidates when first paths return 404", async () => {
    mockQueue([
      fakeRes(404, {}),  // /api/auth/login → skip
      fakeRes(404, {}),  // /proxy/network/api/login → skip
      fakeRes(200, { csrf: "tok2" }, ["TOKEN=tok2; Path=/"]),  // /api/login → ok
      fakeRes(200, { data: [apDevice] }),
      fakeRes(200, { data: staList }),
      fakeRes(200, { data: [{ ...apDevice, tx_bytes: 1_001_000, rx_bytes: 2_001_000 }] }),
    ]);
    const r = await checkUnifi(apIp, ctrl, auth, 443, "default", false);
    expect(r.model).toBe("UAP-AC-Lite");
  });

  it("throws on invalid credentials (HTTP 401 on login)", async () => {
    mockQueue([fakeRes(401, {}), fakeRes(401, {}), fakeRes(401, {})]);
    await expect(checkUnifi(apIp, ctrl, auth, 443, "default", false)).rejects.toThrow(/inválidas/i);
  });

  it("throws when no login endpoint found (all 404)", async () => {
    mockQueue([fakeRes(404, {}), fakeRes(404, {}), fakeRes(404, {})]);
    await expect(checkUnifi(apIp, ctrl, auth, 443, "default", false)).rejects.toThrow(/não encontrado/i);
  });

  it("API key path signal and SSID are null (Integration API limitation)", async () => {
    mockQueue([
      fakeRes(200, { data: [{ id: "site-1", name: "default", internalReference: "default" }] }),
      fakeRes(200, { data: [{ id: "site-1", name: "default", internalReference: "default" }] }),
      fakeRes(200, { data: [{ id: "dev-1", macAddress: "aa:bb", model: "U6", ipAddress: apIp }] }),
      fakeRes(200, {}),
      fakeRes(200, { data: [{ id: "c1", type: "WIRELESS", uplinkDeviceId: "dev-1", macAddress: "11:22" }] }),
      fakeRes(200, { data: [] }),
    ]);
    const r = await checkUnifi(apIp, ctrl, { method: "apikey", apiKey: "k" }, 443, "default", false);
    expect(r.clients[0].signal).toBeNull();
    expect(r.clients[0].ssid).toBeNull();
  });
});
