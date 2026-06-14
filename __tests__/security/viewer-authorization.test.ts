/**
 * @jest-environment node
 *
 * SEC-028 / SEC-029 — role-based authorization.
 * Endpoints that trigger active network operations or expose webhook tokens
 * must reject VIEWER (403) and only allow OPERADOR+.
 */
process.env.WEBHOOK_SECRET = "test-webhook-secret-for-authz-tests-32chars-min";

import { GET as linksGET } from "@/app/api/links/route";
import { POST as devicesCheckPOST } from "@/app/api/devices/check/route";
import { POST as deviceCheckPOST } from "@/app/api/devices/[id]/check/route";
import { POST as testTrafficPOST } from "@/app/api/links/test-traffic/route";
import { GET as liveTrafficGET } from "@/app/api/links/[id]/live-traffic/route";
import { NextRequest } from "next/server";

import { auth } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    link: {
      findMany: jest.fn().mockResolvedValue([
        { id: "link-1", name: "Link 1", createdAt: new Date(), _count: { events: 0 } },
      ]),
      findUnique: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
    },
    device: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn() },
  },
}));

jest.mock("@/worker/scheduler", () => ({ runChecks: jest.fn() }));
jest.mock("@/worker/monitors/link-traffic", () => ({ checkLinkTraffic: jest.fn() }));

const mockAuth = auth as unknown as jest.Mock;
const asSession = (role: string) => ({ user: { id: "u1", name: "u", role } });

const FAKE_PARAMS = Promise.resolve({ id: "x" });

beforeEach(() => jest.clearAllMocks());

describe("VIEWER is forbidden (403) on active-operation endpoints", () => {
  beforeEach(() => mockAuth.mockResolvedValue(asSession("VIEWER")));

  it("POST /api/devices/check → 403", async () => {
    const res = await devicesCheckPOST(new NextRequest("http://localhost/api/devices/check", { method: "POST" }));
    expect(res.status).toBe(403);
  });

  it("POST /api/devices/:id/check → 403", async () => {
    const res = await deviceCheckPOST(new NextRequest("http://localhost/api/devices/x/check", { method: "POST" }), { params: FAKE_PARAMS });
    expect(res.status).toBe(403);
  });

  it("POST /api/links/test-traffic → 403", async () => {
    const req = new NextRequest("http://localhost/api/links/test-traffic", {
      method: "POST",
      body: JSON.stringify({ mikrotikDeviceId: "d1", mikrotikInterface: "ether1" }),
    });
    const res = await testTrafficPOST(req);
    expect(res.status).toBe(403);
  });

  it("GET /api/links/:id/live-traffic → 403", async () => {
    const res = await liveTrafficGET(new NextRequest("http://localhost/api/links/x/live-traffic"), { params: FAKE_PARAMS });
    expect(res.status).toBe(403);
  });
});

describe("OPERADOR is allowed on active-operation endpoints", () => {
  beforeEach(() => mockAuth.mockResolvedValue(asSession("OPERADOR")));

  it("POST /api/devices/check → not 403", async () => {
    const res = await devicesCheckPOST(new NextRequest("http://localhost/api/devices/check", { method: "POST" }));
    expect(res.status).not.toBe(403);
  });
});

describe("SEC-028 — webhookToken exposure by role", () => {
  it("VIEWER does NOT receive webhookToken in GET /api/links", async () => {
    mockAuth.mockResolvedValue(asSession("VIEWER"));
    const res = await linksGET(new NextRequest("http://localhost/api/links"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0]).not.toHaveProperty("webhookToken");
  });

  it("OPERADOR DOES receive webhookToken in GET /api/links", async () => {
    mockAuth.mockResolvedValue(asSession("OPERADOR"));
    const res = await linksGET(new NextRequest("http://localhost/api/links"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0]).toHaveProperty("webhookToken");
  });

  it("unauthenticated GET /api/links → 401", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await linksGET(new NextRequest("http://localhost/api/links"));
    expect(res.status).toBe(401);
  });
});
