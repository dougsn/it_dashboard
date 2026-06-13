/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: { device: { findUnique: jest.fn() } },
}));

jest.mock("@/lib/crypto", () => ({
  resolveRouterosCredentials: jest.fn(),
}));

jest.mock("@/worker/monitors/link-traffic", () => ({
  checkLinkTraffic: jest.fn(),
}));

import { POST } from "@/app/api/links/test-traffic/route";
import { db } from "@/lib/db";
import { resolveRouterosCredentials } from "@/lib/crypto";
import { checkLinkTraffic } from "@/worker/monitors/link-traffic";

const mockDb = db as jest.Mocked<typeof db>;
const mockCreds = resolveRouterosCredentials as jest.Mock;
const mockTraffic = checkLinkTraffic as jest.Mock;

const DEVICE = { id: "dev1", name: "MK", ip: "10.0.0.1", routerosPort: 8728, routerosEnabled: true };

function makeReq(body: unknown) {
  return new Request("http://localhost/api/links/test-traffic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.device.findUnique as jest.Mock).mockResolvedValue(DEVICE);
  mockCreds.mockReturnValue({ user: "admin", pass: "pass" });
  mockTraffic.mockResolvedValue({ downloadBps: 2_000_000, uploadBps: 1_000_000 });
});

describe("POST /api/links/test-traffic", () => {
  it("returns traffic when connection succeeds", async () => {
    const res = await POST(makeReq({ mikrotikDeviceId: "dev1", mikrotikInterface: "ether1" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.downloadBps).toBe(2_000_000);
  });

  it("returns 400 for invalid body", async () => {
    const res = await POST(makeReq({ mikrotikDeviceId: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("http://localhost/api/links/test-traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when device not found", async () => {
    (mockDb.device.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeReq({ mikrotikDeviceId: "bad", mikrotikInterface: "ether1" }));
    expect(res.status).toBe(404);
  });

  it("returns 422 when routeros not enabled or no creds", async () => {
    mockCreds.mockReturnValue(null);
    const res = await POST(makeReq({ mikrotikDeviceId: "dev1", mikrotikInterface: "ether1" }));
    expect(res.status).toBe(422);
  });

  it("returns 422 with connection error message on ECONNREFUSED", async () => {
    mockTraffic.mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await POST(makeReq({ mikrotikDeviceId: "dev1", mikrotikInterface: "ether1" }));
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.error).toContain("Não foi possível conectar");
  });

  it("returns 422 with auth error message on bad credentials", async () => {
    mockTraffic.mockRejectedValue(new Error("invalid login"));
    const res = await POST(makeReq({ mikrotikDeviceId: "dev1", mikrotikInterface: "ether1" }));
    const body = await res.json();
    expect(body.error).toContain("Credenciais inválidas");
  });

  it("returns 422 with interface error message when interface not found", async () => {
    mockTraffic.mockRejectedValue(new Error("no such interface"));
    const res = await POST(makeReq({ mikrotikDeviceId: "dev1", mikrotikInterface: "bad-iface" }));
    const body = await res.json();
    expect(body.error).toContain("não encontrada");
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ mikrotikDeviceId: "dev1", mikrotikInterface: "ether1" }));
    expect(res.status).toBe(401);
  });
});
