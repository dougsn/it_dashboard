/**
 * @jest-environment node
 */
jest.mock("@/lib/auth", () => ({
  auth: jest.fn().mockResolvedValue({ user: { id: "u1", role: "ADMIN" } }),
}));

jest.mock("@/lib/db", () => ({
  db: { device: { findUnique: jest.fn(), findMany: jest.fn() } },
}));

jest.mock("@/worker/scheduler", () => ({
  runChecks: jest.fn().mockResolvedValue(undefined),
}));

import { POST as checkById } from "@/app/api/devices/[id]/check/route";
import { POST as checkBulk } from "@/app/api/devices/check/route";
import { db } from "@/lib/db";
import { runChecks } from "@/worker/scheduler";

const mockDb = db as jest.Mocked<typeof db>;
const mockRun = runChecks as jest.Mock;

const DEVICE = { id: "dev1", name: "Router", ip: "10.0.0.1", type: "MIKROTIK" };

function makeReq(url: string) {
  return new Request(url, { method: "POST" });
}

beforeEach(() => {
  jest.clearAllMocks();
  (mockDb.device.findUnique as jest.Mock).mockResolvedValue(DEVICE);
  (mockDb.device.findMany as jest.Mock).mockResolvedValue([DEVICE]);
  mockRun.mockResolvedValue(undefined);
});

describe("POST /api/devices/[id]/check", () => {
  it("triggers check and returns ok", async () => {
    const res = await checkById(makeReq("http://localhost/api/devices/dev1/check"), {
      params: Promise.resolve({ id: "dev1" }),
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockRun).toHaveBeenCalledWith(DEVICE);
  });

  it("returns 404 when device not found", async () => {
    (mockDb.device.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await checkById(makeReq("http://localhost/api/devices/bad/check"), {
      params: Promise.resolve({ id: "bad" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns ok even when runChecks throws", async () => {
    mockRun.mockRejectedValueOnce(new Error("network error"));
    const res = await checkById(makeReq("http://localhost/api/devices/dev1/check"), {
      params: Promise.resolve({ id: "dev1" }),
    });
    expect(res.status).toBe(200);
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await checkById(makeReq("http://localhost/api/devices/dev1/check"), {
      params: Promise.resolve({ id: "dev1" }),
    });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/devices/check (bulk)", () => {
  it("checks all devices and returns count", async () => {
    const res = await checkBulk(makeReq("http://localhost/api/devices/check"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.checked).toBe(1);
    expect(body.errors).toHaveLength(0);
  });

  it("filters by type when ?type= is provided", async () => {
    const req = new Request("http://localhost/api/devices/check?type=MIKROTIK", { method: "POST" });
    await checkBulk(req);
    const call = (mockDb.device.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where?.type).toBe("MIKROTIK");
  });

  it("returns 400 for invalid device type", async () => {
    const req = new Request("http://localhost/api/devices/check?type=INVALID", { method: "POST" });
    const res = await checkBulk(req);
    expect(res.status).toBe(400);
  });

  it("includes failed checks in errors array", async () => {
    mockRun.mockRejectedValueOnce(new Error("timeout"));
    const res = await checkBulk(makeReq("http://localhost/api/devices/check"));
    const body = await res.json();
    expect(body.errors).toHaveLength(1);
    expect(body.errors[0].device).toBe("Router");
  });

  it("returns 401 when unauthenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);
    const res = await checkBulk(makeReq("http://localhost/api/devices/check"));
    expect(res.status).toBe(401);
  });
});
