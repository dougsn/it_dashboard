/**
 * @jest-environment node
 */

jest.mock("https", () => ({ request: jest.fn() }));
jest.mock("http",  () => ({ request: jest.fn() }));

import * as https from "https";
import { checkOmada, resolveOmadaSiteId } from "@/worker/monitors/omada";

const mockRequest = https.request as jest.Mock;

function fakeRes(statusCode: number, body: unknown) {
  const raw = JSON.stringify(body);
  const listeners: Record<string, ((...a: unknown[]) => void)[]> = {};
  const res = {
    statusCode,
    headers: {},
    on(ev: string, cb: (...a: unknown[]) => void) { (listeners[ev] ??= []).push(cb); return res; },
    _flush() { (listeners["data"] ?? []).forEach((cb) => cb(raw)); (listeners["end"] ?? []).forEach((cb) => cb()); },
  };
  return res;
}

function fakeReq() {
  return { on: jest.fn().mockReturnThis(), setTimeout: jest.fn().mockReturnThis(), write: jest.fn(), end: jest.fn(), destroy: jest.fn() };
}

function mockQueue(responses: ReturnType<typeof fakeRes>[]) {
  let idx = 0;
  mockRequest.mockImplementation((_opts: unknown, cb: (r: ReturnType<typeof fakeRes>) => void) => {
    const req = fakeReq();
    const res = responses[idx++];
    setImmediate(() => { cb(res); res._flush(); });
    return req;
  });
}

beforeEach(() => jest.clearAllMocks());

// ── Shared fixtures ────────────────────────────────────────────────────────────

const apIp      = "192.168.10.20";
const ctrl      = "10.0.0.19";
const omadacId  = "abc123";
const clientId  = "my-client-id";
const secret    = "my-client-secret";
const siteId    = "site-abc";

const apDevice = {
  mac: "AA:BB:CC:DD:EE:FF",
  ip: apIp,
  model: "EAP670",
  modelName: "EAP670",
  firmwareVersion: "5.1.0",
  uptime: 7200,
  cpuUtil: 12,
  memUtil: 45,
  clientNum: 3,
};

const clientsPayload = [
  { mac: "11:22:33:44:55:01", hostName: "Phone",  ip: "192.168.10.51", rssi: -55, snr: 40, ssid: "HomeNet", radioId: 1, channel: 149, apMac: "AA:BB:CC:DD:EE:FF", rxRate: 1_500_000, txRate: 800_000, wifiMode: 5, uptime: 3600 },
  { mac: "11:22:33:44:55:02", hostName: "Laptop", ip: "192.168.10.52", rssi: -72, snr: 23, ssid: "HomeNet", radioId: 0, channel:   6, apMac: "AA:BB:CC:DD:EE:FF", rxRate:   500_000, txRate: 200_000, wifiMode: 6, uptime: 7200 },
];

// Request order: 1=token, 2=devices+clients (parallel)
function fullSuccess() {
  mockQueue([
    fakeRes(200, { errorCode: 0, result: { accessToken: "AT-test-token", expiresIn: 7200, refreshToken: "RT-xxx" } }),
    fakeRes(200, { result: { data: [apDevice] } }),
    fakeRes(200, { result: { data: clientsPayload } }),
  ]);
}

// ── Happy path ─────────────────────────────────────────────────────────────────

describe("checkOmada — success", () => {
  it("returns full AP data", async () => {
    fullSuccess();
    const r = await checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false);

    expect(r.model).toBe("EAP670");
    expect(r.firmware).toBe("5.1.0");
    expect(r.cpuLoad).toBe(12);
    expect(r.memoryUsed).toBe(45);
    expect(r.totalClients).toBe(2);
  });

  it("parses uptime string to seconds", async () => {
    mockQueue([
      fakeRes(200, { errorCode: 0, result: { accessToken: "AT-test-token", expiresIn: 7200, refreshToken: "RT-xxx" } }),
      fakeRes(200, { result: { data: [{ ...apDevice, uptime: "1day(s) 0h 0m 0s" }] } }),
      fakeRes(200, { result: { data: clientsPayload } }),
    ]);
    const r = await checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false);
    expect(r.uptime).toBe(86400);
  });

  it("accepts numeric uptime from devices list", async () => {
    fullSuccess();
    const r = await checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false);
    expect(r.uptime).toBe(7200);
  });

  it("aggregates client rxRate as downlink and txRate as uplink", async () => {
    fullSuccess();
    const r = await checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false);

    // uplinkRxBps = AP downlink = sum of client rxRate (1_500_000 + 500_000)
    expect(r.uplinkRxBps).toBe(2_000_000);
    // uplinkTxBps = AP uplink = sum of client txRate (800_000 + 200_000)
    expect(r.uplinkTxBps).toBe(1_000_000);
  });

  it("returns null traffic when no clients are connected", async () => {
    mockQueue([
      fakeRes(200, { errorCode: 0, result: { accessToken: "AT-test-token", expiresIn: 7200, refreshToken: "RT-xxx" } }),
      fakeRes(200, { result: { data: [apDevice] } }),
      fakeRes(200, { result: { data: [] } }),
    ]);
    const r = await checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false);
    expect(r.uplinkRxBps).toBeNull();
    expect(r.uplinkTxBps).toBeNull();
    expect(r.totalClients).toBe(0);
  });

  it("maps clients with signal, SNR, SSID, band, wifiMode, and uptime", async () => {
    fullSuccess();
    const r = await checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false);

    expect(r.clients).toHaveLength(2);
    expect(r.clients[0]).toMatchObject({ name: "Phone",  signal: -55, snr: 40, ssid: "HomeNet", band: "5 GHz",   wifiMode: 5, uptime: 3600 });
    expect(r.clients[1]).toMatchObject({ name: "Laptop", signal: -72, snr: 23, ssid: "HomeNet", band: "2.4 GHz", wifiMode: 6, uptime: 7200 });
  });

  it("returns SSIDs with band labels", async () => {
    fullSuccess();
    const r = await checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false);

    expect(r.ssids).toHaveLength(1);
    expect(r.ssids[0]).toMatchObject({ ssid: "HomeNet", band: "2.4 GHz / 5 GHz", channel: "6 / 149" });
  });

  it("uses Authorization: AccessToken= header after token request", async () => {
    fullSuccess();
    await checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false);

    const calls = mockRequest.mock.calls;
    for (let i = 1; i < calls.length; i++) {
      const opts = calls[i][0] as { headers?: Record<string, string> };
      expect(opts.headers?.["Authorization"]).toMatch(/^AccessToken=AT-/);
    }
  });
});

// ── Single-AP fallback ─────────────────────────────────────────────────────────

describe("checkOmada — single-AP fallback", () => {
  it("uses the only device when AP IP is not matched but list has exactly one entry", async () => {
    const otherAp = { ...apDevice, ip: "10.0.0.1" };
    mockQueue([
      fakeRes(200, { errorCode: 0, result: { accessToken: "AT-test-token", expiresIn: 7200, refreshToken: "RT-xxx" } }),
      fakeRes(200, { result: { data: [otherAp] } }),
      fakeRes(200, { result: { data: [] } }),
    ]);

    const r = await checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false);
    expect(r.model).toBe("EAP670");
  });

  it("throws when AP IP not found and multiple devices exist", async () => {
    const anotherAp = { ...apDevice, mac: "FF:EE:DD:CC:BB:AA", ip: "10.0.0.2" };
    mockQueue([
      fakeRes(200, { errorCode: 0, result: { accessToken: "AT-test-token", expiresIn: 7200, refreshToken: "RT-xxx" } }),
      fakeRes(200, { result: { data: [{ ...apDevice, ip: "10.0.0.1" }, anotherAp] } }),
      fakeRes(200, { result: { data: [] } }), // clients (parallel with devices)
    ]);

    await expect(checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false))
      .rejects.toThrow(/não encontrado/i);
  });
});

// ── Auth / token failures ──────────────────────────────────────────────────────

describe("checkOmada — error cases", () => {
  it("throws on invalid client credentials (errorCode -44106)", async () => {
    mockQueue([fakeRes(200, { errorCode: -44106 })]);
    await expect(checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false))
      .rejects.toThrow(/client_id ou client_secret inválidos/i);
  });

  it("throws on generic auth failure", async () => {
    mockQueue([fakeRes(200, { errorCode: -44112 })]);
    await expect(checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false))
      .rejects.toThrow(/autenticação/i);
  });

  it("throws when token response is HTTP error", async () => {
    mockQueue([fakeRes(500, { errorCode: -1 })]);
    await expect(checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false))
      .rejects.toThrow(/autenticação/i);
  });

  it("throws when token response has no accessToken", async () => {
    mockQueue([fakeRes(200, { errorCode: 0, result: {} })]);
    await expect(checkOmada(apIp, ctrl, omadacId, clientId, secret, siteId, false))
      .rejects.toThrow(/autenticação/i);
  });
});

// ── Site id resolution (self-heal for bulk-created devices) ─────────────────────

describe("resolveOmadaSiteId", () => {
  // Request order: 1=token, 2=sites list
  const sites = [
    { siteId: "site-default", name: "Default" },
    { siteId: "site-bota",    name: "Botafogo" },
  ];

  it("resolves the site id from the name, case-insensitively", async () => {
    mockQueue([
      fakeRes(200, { errorCode: 0, result: { accessToken: "AT", expiresIn: 7200 } }),
      fakeRes(200, { result: { data: sites } }),
    ]);
    // bulk stored "default" (lowercase) — must match "Default"
    const resolved = await resolveOmadaSiteId(ctrl, omadacId, clientId, secret, "default", false);
    expect(resolved).toEqual({ siteId: "site-default", name: "Default", matchedByName: true });
  });

  it("falls back to the only site when the name does not match (single-site controller)", async () => {
    mockQueue([
      fakeRes(200, { errorCode: 0, result: { accessToken: "AT", expiresIn: 7200 } }),
      fakeRes(200, { result: { data: [{ siteId: "site-bota", name: "Botafogo" }] } }),
    ]);
    // bulk stored "default" but the controller's only site is "Botafogo"
    const resolved = await resolveOmadaSiteId(ctrl, omadacId, clientId, secret, "default", false);
    expect(resolved).toEqual({ siteId: "site-bota", name: "Botafogo", matchedByName: false });
  });

  it("returns null when no name matches and there are multiple sites", async () => {
    mockQueue([
      fakeRes(200, { errorCode: 0, result: { accessToken: "AT", expiresIn: 7200 } }),
      fakeRes(200, { result: { data: sites } }),
    ]);
    const resolved = await resolveOmadaSiteId(ctrl, omadacId, clientId, secret, "Inexistente", false);
    expect(resolved).toBeNull();
  });
});
