/**
 * @jest-environment node
 */
jest.mock("https", () => ({ request: jest.fn() }));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: { device: { findUnique: jest.fn() } },
}));

jest.mock("@/lib/crypto", () => ({
  resolveUnifiApiKey: jest.fn(),
  resolveUnifiCredentials: jest.fn(),
}));

import * as https from "https";
import { POST } from "@/app/api/devices/test-unifi/route";
import { db } from "@/lib/db";
import { resolveUnifiApiKey, resolveUnifiCredentials } from "@/lib/crypto";

const mockRequest = https.request as jest.Mock;
const mockDb = db as jest.Mocked<typeof db>;

// ── HTTPS mock helpers ────────────────────────────────────────────────────────

function fakeRes(statusCode: number, body: unknown, cookies: string[] = []) {
  const raw = JSON.stringify(body);
  const listeners: Record<string, ((...a: unknown[]) => void)[]> = {};
  const res = {
    statusCode,
    headers: { "set-cookie": cookies },
    on(ev: string, cb: (...a: unknown[]) => void) { (listeners[ev] ??= []).push(cb); return res; },
    _flush() {
      (listeners["data"] ?? []).forEach((cb) => cb(raw));
      (listeners["end"] ?? []).forEach((cb) => cb());
    },
  };
  return res;
}

function fakeReq() {
  return {
    on: jest.fn().mockReturnThis(),
    setTimeout: jest.fn().mockReturnThis(),
    write: jest.fn(),
    end: jest.fn(),
    destroy: jest.fn(),
  };
}

function mockQueue(responses: ReturnType<typeof fakeRes>[]) {
  let idx = 0;
  mockRequest.mockImplementation((_opts: unknown, cb: (r: ReturnType<typeof fakeRes>) => void) => {
    const req = fakeReq();
    const res = responses[idx++ % responses.length];
    setImmediate(() => { cb(res); res._flush(); });
    return req;
  });
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const VALID_API_KEY_BODY = {
  controllerIp: "10.0.0.1",
  port: 443,
  site: "default",
  tlsVerify: false,
  authMethod: "apikey",
  apiKey: "test-api-key",
};

const VALID_USERPASS_BODY = {
  controllerIp: "10.0.0.1",
  port: 443,
  site: "default",
  tlsVerify: false,
  authMethod: "userpass",
  unifiUser: "admin",
  unifiPass: "password",
};

const SITES_RESPONSE = { data: [{ id: "site1", name: "default", internalReference: "default" }] };
const DEVICES_RESPONSE = { data: [{ mac: "AA:BB:CC:DD:EE:FF", model: "UAP-AC-Pro", name: "AP1", uptime: 3600 }] };
const CLIENTS_RESPONSE = { data: [{ mac: "11:22:33:44:55:66", hostname: "phone", ip: "192.168.1.100" }] };

function makeReq(body: unknown) {
  return new Request("http://localhost/api/devices/test-unifi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.device.findUnique as jest.Mock).mockResolvedValue(null);
  (resolveUnifiApiKey as jest.Mock).mockReturnValue("stored-api-key");
  (resolveUnifiCredentials as jest.Mock).mockReturnValue({ user: "admin", pass: "pass" });
});

// ── API Key auth tests ────────────────────────────────────────────────────────

describe("POST /api/devices/test-unifi — apikey auth", () => {
  it("returns site and device info on success", async () => {
    // First path fails with 404, second path succeeds (sites + devices + clients)
    mockQueue([
      fakeRes(404, {}),
      fakeRes(200, SITES_RESPONSE),
      fakeRes(200, DEVICES_RESPONSE),
      fakeRes(200, CLIENTS_RESPONSE),
    ]);

    const res = await POST(makeReq(VALID_API_KEY_BODY));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.sites).toBeDefined();
  });

  it("returns 422 on HTTP 401 (invalid API key)", async () => {
    mockQueue([fakeRes(401, { error: "unauthorized" })]);
    const res = await POST(makeReq(VALID_API_KEY_BODY));
    expect(res.status).toBe(422);
  });

  it("returns 422 on HTTP 403 (no permission)", async () => {
    mockQueue([fakeRes(403, { error: "forbidden" })]);
    const res = await POST(makeReq(VALID_API_KEY_BODY));
    expect(res.status).toBe(422);
  });

  it("returns 422 when both candidate paths return 404", async () => {
    mockQueue([fakeRes(404, {}), fakeRes(404, {})]);
    const res = await POST(makeReq(VALID_API_KEY_BODY));
    expect(res.status).toBe(422);
  });

  it("returns 422 on ECONNREFUSED", async () => {
    mockRequest.mockImplementation((_opts: unknown, _cb: unknown) => {
      const req = fakeReq();
      setImmediate(() => {
        const errCb = (req.on as jest.Mock).mock.calls.find(([ev]: [string]) => ev === "error")?.[1];
        const err = Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" });
        errCb?.(err);
      });
      return req;
    });

    const res = await POST(makeReq(VALID_API_KEY_BODY));
    expect(res.status).toBe(422);
  });

  it("resolves stored credentials when deviceId provided", async () => {
    const deviceWithKey = { id: "dev1", unifiApiKeyEnc: "enc-key" };
    (mockDb.device.findUnique as jest.Mock).mockResolvedValue(deviceWithKey);

    mockQueue([
      fakeRes(200, SITES_RESPONSE),
      fakeRes(200, DEVICES_RESPONSE),
      fakeRes(200, CLIENTS_RESPONSE),
    ]);

    const res = await POST(makeReq({
      ...VALID_API_KEY_BODY,
      deviceId: "dev1",
      apiKey: undefined,
    }));

    expect(resolveUnifiApiKey).toHaveBeenCalledWith(deviceWithKey);
    expect(res.status).toBe(200);
  });
});

// ── User/pass auth tests ──────────────────────────────────────────────────────

describe("POST /api/devices/test-unifi — userpass auth", () => {
  it("returns 200 on successful login and connectivity check", async () => {
    // login (POST cookie), then GET sites with csrf, then devices, clients
    mockQueue([
      fakeRes(200, { data: { account: {} } }, ["TOKEN=abc; Path=/"]),  // login
      fakeRes(200, { data: { csrfToken: "csrf123" } }),                // GET self
      fakeRes(200, SITES_RESPONSE),                                     // sites
      fakeRes(200, DEVICES_RESPONSE),                                   // devices
      fakeRes(200, CLIENTS_RESPONSE),                                   // clients
    ]);

    const res = await POST(makeReq(VALID_USERPASS_BODY));
    expect(res.status).toBe(200);
  });

  it("returns 422 when login returns non-200", async () => {
    mockQueue([fakeRes(401, { message: "invalid credentials" })]);
    const res = await POST(makeReq(VALID_USERPASS_BODY));
    expect(res.status).toBe(422);
  });
});

// ── Validation tests ──────────────────────────────────────────────────────────

describe("POST /api/devices/test-unifi — validation", () => {
  it("returns 400 for missing required fields", async () => {
    const res = await POST(makeReq({ controllerIp: "10.0.0.1" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("http://localhost/api/devices/test-unifi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "bad",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await POST(makeReq(VALID_API_KEY_BODY));
    expect(res.status).toBe(401);
  });

  it("returns 403 when role is VIEWER", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "VIEWER" } });
    const res = await POST(makeReq(VALID_API_KEY_BODY));
    expect(res.status).toBe(403);
  });
});
