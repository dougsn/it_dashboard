/**
 * @jest-environment node
 */

import type { Device } from "@prisma/client";

jest.mock("@/lib/db", () => ({
  db: {
    deviceStatus:    { upsert: jest.fn() },
    statusHistory:   { create: jest.fn(), deleteMany: jest.fn() },
    linkEvent:       { deleteMany: jest.fn() },
    link:            { findMany: jest.fn(), update: jest.fn() },
    device:          { findMany: jest.fn(), findUnique: jest.fn() },
    workerHeartbeat: { upsert: jest.fn() },
    $transaction:    jest.fn(),
  },
}));

jest.mock("@/worker/monitors/ping",         () => ({ checkPing:        jest.fn() }));
jest.mock("@/worker/monitors/http",         () => ({ checkHttp:        jest.fn() }));
jest.mock("@/worker/monitors/snmp",         () => ({ checkSnmp:        jest.fn() }));
jest.mock("@/worker/monitors/routeros",     () => ({ checkRouterOS:    jest.fn() }));
jest.mock("@/worker/monitors/link-traffic", () => ({ checkLinkTraffic: jest.fn() }));
jest.mock("@/lib/crypto", () => ({
  resolveRouterosCredentials: jest.fn(),
}));

import { db } from "@/lib/db";
import { checkPing }        from "@/worker/monitors/ping";
import { checkHttp }        from "@/worker/monitors/http";
import { checkSnmp }        from "@/worker/monitors/snmp";
import { checkRouterOS }    from "@/worker/monitors/routeros";
import { checkLinkTraffic } from "@/worker/monitors/link-traffic";
import { resolveRouterosCredentials } from "@/lib/crypto";
import { runChecks, pruneHistory, pollLinks, shutdown } from "@/worker/scheduler";

const mockDb                     = db as jest.Mocked<typeof db>;
const mockCheckPing               = checkPing        as jest.Mock;
const mockCheckHttp               = checkHttp        as jest.Mock;
const mockCheckSnmp               = checkSnmp        as jest.Mock;
const mockCheckRouterOS           = checkRouterOS    as jest.Mock;
const mockCheckLinkTraffic        = checkLinkTraffic as jest.Mock;
const mockResolveCredentials      = resolveRouterosCredentials as jest.Mock;

const baseDevice: Device = {
  id:              "dev-1",
  name:            "Router Test",
  ip:              "192.168.1.1",
  type:            "MIKROTIK",
  location:        null,
  notes:           null,
  pingEnabled:     true,
  httpEnabled:     false,
  httpPort:        null,
  httpPath:        "/",
  snmpEnabled:     false,
  snmpCommunity:   "public",
  snmpPort:        161,
  routerosEnabled: false,
  routerosUser:    null,
  routerosPass:    null,
  routerosUserEnc: null,
  routerosPassEnc: null,
  routerosPort:    8728,
  checkInterval:   60,
  createdAt:       new Date("2026-01-01"),
  updatedAt:       new Date("2026-01-01"),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});

  (mockDb.$transaction as jest.Mock).mockResolvedValue([]);
  (mockDb.deviceStatus.upsert as jest.Mock).mockResolvedValue({});
  (mockDb.statusHistory.create as jest.Mock).mockResolvedValue({});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── runChecks ────────────────────────────────────────────────────────────────

describe("runChecks", () => {
  it("calls checkPing when pingEnabled and writes online status", async () => {
    mockCheckPing.mockResolvedValue({ alive: true, responseMs: 12 });

    await runChecks(baseDevice);

    expect(mockCheckPing).toHaveBeenCalledWith("192.168.1.1");
    expect(mockCheckHttp).not.toHaveBeenCalled();
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1);

    const [[upsertCall]] = (mockDb.$transaction as jest.Mock).mock.calls;
    expect(upsertCall).toHaveLength(2); // [upsert promise, create promise]
  });

  it("does not call checkPing when pingEnabled is false", async () => {
    await runChecks({ ...baseDevice, pingEnabled: false });
    expect(mockCheckPing).not.toHaveBeenCalled();
  });

  it("calls checkHttp when httpEnabled", async () => {
    mockCheckHttp.mockResolvedValue({ ok: true, statusCode: 200, responseMs: 50 });

    await runChecks({ ...baseDevice, pingEnabled: false, httpEnabled: true, httpPort: 80 });

    expect(mockCheckHttp).toHaveBeenCalledWith("192.168.1.1", 80, "/");
  });

  it("calls checkSnmp when snmpEnabled", async () => {
    mockCheckSnmp.mockResolvedValue({ uptime: 3600, cpuLoad: 10, memoryUsed: 50 });

    await runChecks({ ...baseDevice, pingEnabled: false, snmpEnabled: true });

    expect(mockCheckSnmp).toHaveBeenCalledWith("192.168.1.1", "public", 161);
  });

  it("calls checkRouterOS when routerosEnabled and credentials resolved", async () => {
    mockResolveCredentials.mockReturnValue({ user: "admin", pass: "secret" });
    mockCheckRouterOS.mockResolvedValue({ uptime: 7200, cpuLoad: 5, memoryUsed: 40 });

    await runChecks({ ...baseDevice, pingEnabled: false, routerosEnabled: true });

    expect(mockCheckRouterOS).toHaveBeenCalledWith("192.168.1.1", "admin", "secret", 8728);
  });

  it("skips checkRouterOS when credentials cannot be resolved", async () => {
    mockResolveCredentials.mockReturnValue(null);

    await runChecks({ ...baseDevice, pingEnabled: false, routerosEnabled: true });

    expect(mockCheckRouterOS).not.toHaveBeenCalled();
  });

  it("skips checkRouterOS when routerosEnabled is false", async () => {
    await runChecks({ ...baseDevice, routerosEnabled: false });
    expect(mockCheckRouterOS).not.toHaveBeenCalled();
    expect(mockResolveCredentials).not.toHaveBeenCalled();
  });

  it("marks device offline when ping returns alive: false", async () => {
    mockCheckPing.mockResolvedValue({ alive: false, responseMs: null });

    await runChecks(baseDevice);

    // $transaction is called — verify upsert + create were called with isOnline: false
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
    expect(mockDb.deviceStatus.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ isOnline: false }),
      })
    );
  });

  it("logs error when snmp monitor rejects but continues", async () => {
    mockCheckSnmp.mockRejectedValue(new Error("SNMP timeout"));

    await runChecks({ ...baseDevice, pingEnabled: false, snmpEnabled: true });

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[SNMP]")
    );
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
  });

  it("logs error when routeros monitor rejects but continues", async () => {
    mockResolveCredentials.mockReturnValue({ user: "admin", pass: "x" });
    mockCheckRouterOS.mockRejectedValue(new Error("connection refused"));

    await runChecks({ ...baseDevice, pingEnabled: false, routerosEnabled: true });

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[RouterOS]")
    );
    expect(mockDb.$transaction).toHaveBeenCalledTimes(1);
  });
});

// ─── pruneHistory ─────────────────────────────────────────────────────────────

describe("pruneHistory", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (mockDb.statusHistory.deleteMany as jest.Mock).mockResolvedValue({ count: 100 });
    (mockDb.linkEvent.deleteMany as jest.Mock).mockResolvedValue({ count: 20 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls deleteMany on statusHistory and linkEvent", async () => {
    await pruneHistory();
    expect(mockDb.statusHistory.deleteMany).toHaveBeenCalledTimes(1);
    expect(mockDb.linkEvent.deleteMany).toHaveBeenCalledTimes(1);
  });

  it("uses a cutoff 30 days in the past", async () => {
    const now = new Date("2026-06-05T12:00:00Z").getTime();
    jest.setSystemTime(now);

    await pruneHistory();

    const expectedCutoff = new Date(now - 30 * 24 * 3_600_000);

    expect(mockDb.statusHistory.deleteMany).toHaveBeenCalledWith({
      where: { timestamp: { lt: expectedCutoff } },
    });
    expect(mockDb.linkEvent.deleteMany).toHaveBeenCalledWith({
      where: { timestamp: { lt: expectedCutoff } },
    });
  });

  it("logs the number of pruned records", async () => {
    await pruneHistory();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("100")
    );
  });
});

// ─── pollLinks ────────────────────────────────────────────────────────────────

describe("pollLinks", () => {
  it("queries only links with mikrotikDeviceId and interface set", async () => {
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([]);

    await pollLinks();

    expect(mockDb.link.findMany).toHaveBeenCalledWith({
      where: {
        mikrotikDeviceId: { not: null },
        mikrotikInterface: { not: null },
      },
      include: { mikrotikDevice: true },
    });
  });

  it("skips link when mikrotikDevice is null", async () => {
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([
      { id: "link-1", name: "Link A", mikrotikDevice: null, mikrotikInterface: "ether1" },
    ]);

    await pollLinks();

    expect(mockCheckLinkTraffic).not.toHaveBeenCalled();
  });

  it("skips link when credentials cannot be resolved", async () => {
    mockResolveCredentials.mockReturnValue(null);
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([
      {
        id: "link-1",
        name: "Link A",
        mikrotikInterface: "ether1",
        mikrotikDevice: { ...baseDevice },
      },
    ]);

    await pollLinks();

    expect(mockCheckLinkTraffic).not.toHaveBeenCalled();
  });

  it("calls checkLinkTraffic and updates link when credentials are valid", async () => {
    mockResolveCredentials.mockReturnValue({ user: "admin", pass: "secret" });
    mockCheckLinkTraffic.mockResolvedValue({ downloadBps: 10_000_000, uploadBps: 5_000_000 });
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([
      {
        id: "link-1",
        name: "Link A",
        mikrotikInterface: "ether1",
        mikrotikDevice: { ...baseDevice },
      },
    ]);

    await pollLinks();

    expect(mockCheckLinkTraffic).toHaveBeenCalledWith(
      "192.168.1.1", "admin", "secret", 8728, "ether1"
    );
    expect(mockDb.link.update).toHaveBeenCalledWith({
      where: { id: "link-1" },
      data: { downloadBps: 10_000_000, uploadBps: 5_000_000 },
    });
  });

  it("logs error but does not throw when checkLinkTraffic fails", async () => {
    mockResolveCredentials.mockReturnValue({ user: "admin", pass: "secret" });
    mockCheckLinkTraffic.mockRejectedValue(new Error("timeout"));
    (mockDb.link.findMany as jest.Mock).mockResolvedValue([
      {
        id: "link-1",
        name: "Link A",
        mikrotikInterface: "ether1",
        mikrotikDevice: { ...baseDevice },
      },
    ]);

    await expect(pollLinks()).resolves.not.toThrow();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[Link]")
    );
  });
});

// ─── shutdown ─────────────────────────────────────────────────────────────────

describe("shutdown", () => {
  it("resolves without throwing when there are no pending checks", async () => {
    await expect(shutdown(100)).resolves.toBeUndefined();
  });

  it("resolves within the timeout even with a short deadline", async () => {
    const start = Date.now();
    await shutdown(50);
    expect(Date.now() - start).toBeLessThan(300);
  });

  it("resolves again after being called a second time (idempotent)", async () => {
    await shutdown(50);
    await expect(shutdown(50)).resolves.toBeUndefined();
  });
});
