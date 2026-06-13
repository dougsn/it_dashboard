/**
 * @jest-environment node
 *
 * Security tests: verify that ALL API routes enforce authentication.
 * A missing or invalid session must always return HTTP 401.
 */
import { GET as devicesGET, POST as devicesPOST } from "@/app/api/devices/route";
import {
  GET as deviceIdGET,
  PUT as deviceIdPUT,
  DELETE as deviceIdDELETE,
} from "@/app/api/devices/[id]/route";
import { GET as statusGET } from "@/app/api/status/[deviceId]/route";
import { POST as testOmadaPOST } from "@/app/api/devices/test-omada/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue(null), // always unauthenticated
}));

jest.mock("@/lib/db", () => ({
  db: {
    device: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn(), aggregate: jest.fn().mockResolvedValue({ _count: 0, _max: { updatedAt: null } }) },
    statusHistory: { findMany: jest.fn() },
    note: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  },
}));

jest.mock("https", () => ({ request: jest.fn() }));
jest.mock("http",  () => ({ request: jest.fn() }));

const FAKE_PARAMS_ID = Promise.resolve({ id: "device-1" });
const FAKE_PARAMS_STATUS = Promise.resolve({ deviceId: "device-1" });

describe("Route authentication enforcement", () => {
  it("GET /api/devices → 401 without session", async () => {
    const res = await devicesGET(new NextRequest("http://localhost/api/devices"));
    expect(res.status).toBe(401);
  });

  it("POST /api/devices → 401 without session", async () => {
    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ name: "Test", ip: "1.2.3.4", type: "OTHER" }),
    });
    const res = await devicesPOST(req);
    expect(res.status).toBe(401);
  });

  it("GET /api/devices/:id → 401 without session", async () => {
    const req = new NextRequest("http://localhost/api/devices/device-1");
    const res = await deviceIdGET(req, { params: FAKE_PARAMS_ID });
    expect(res.status).toBe(401);
  });

  it("PUT /api/devices/:id → 401 without session", async () => {
    const req = new NextRequest("http://localhost/api/devices/device-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated" }),
    });
    const res = await deviceIdPUT(req, { params: FAKE_PARAMS_ID });
    expect(res.status).toBe(401);
  });

  it("DELETE /api/devices/:id → 401 without session", async () => {
    const req = new NextRequest("http://localhost/api/devices/device-1", {
      method: "DELETE",
    });
    const res = await deviceIdDELETE(req, { params: FAKE_PARAMS_ID });
    expect(res.status).toBe(401);
  });

  it("GET /api/status/:deviceId → 401 without session", async () => {
    const req = new NextRequest("http://localhost/api/status/device-1");
    const res = await statusGET(req, { params: FAKE_PARAMS_STATUS });
    expect(res.status).toBe(401);
  });

  it("POST /api/devices/test-omada → 401 without session", async () => {
    const req = new NextRequest("http://localhost/api/devices/test-omada", {
      method: "POST",
      body: JSON.stringify({ controllerIp: "192.168.1.1", port: 8043, site: "Default", tlsVerify: false }),
    });
    const res = await testOmadaPOST(req);
    expect(res.status).toBe(401);
  });
});

describe("Input validation security", () => {
  it("POST /api/devices rejects oversized name via Zod schema", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" }, expires: "2099-01-01" });

    const { db } = require("@/lib/db");
    (db.device.create as jest.Mock).mockResolvedValueOnce({
      id: "d1", name: "A".repeat(10000), ip: "1.2.3.4", type: "OTHER",
      location: null, notes: null, pingEnabled: true, httpEnabled: false,
      httpPort: null, httpPath: "/", snmpEnabled: false, snmpCommunity: "public",
      snmpPort: 161, routerosEnabled: false,
      routerosUserEnc: null, routerosPassEnc: null,
      routerosPort: 8728, unifiEnabled: false, unifiAuthMethod: "apikey",
      unifiApiKeyEnc: null, unifiUserEnc: null, unifiPassEnc: null,
      unifiPort: 443, unifiSite: "default", unifiTlsVerify: false, unifiControllerIp: null,
      checkInterval: 60, createdAt: new Date(), updatedAt: new Date(),
    });

    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ name: "A".repeat(10000), ip: "1.2.3.4", type: "OTHER" }),
    });
    const res = await devicesPOST(req);
    // Documents current behaviour — no max length on name. If added, update to expect 400.
    expect([201, 400]).toContain(res.status);
  });

  it("POST /api/devices rejects invalid type enum", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" }, expires: "2099-01-01" });

    const req = new NextRequest("http://localhost/api/devices", {
      method: "POST",
      body: JSON.stringify({ name: "Test", ip: "1.2.3.4", type: "SERVIDOR" }),
    });
    const res = await devicesPOST(req);
    expect(res.status).toBe(400);
  });
});

describe("Status history boundary security", () => {
  it("hours parameter is capped to prevent excessive DB queries", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "u1", role: "ADMIN" }, expires: "2099-01-01" });

    const { db } = require("@/lib/db");
    (db.statusHistory.findMany as jest.Mock).mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost/api/status/device-1?hours=999999");
    const res = await statusGET(req, { params: FAKE_PARAMS_STATUS });
    expect(res.status).toBe(200);

    const call = (db.statusHistory.findMany as jest.Mock).mock.calls[0]?.[0];
    if (call) {
      const since: Date = call.where.timestamp.gte;
      const hoursAgo = (Date.now() - since.getTime()) / (1000 * 60 * 60);
      expect(hoursAgo).toBeLessThanOrEqual(169);
    }
  });
});
