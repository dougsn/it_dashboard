/**
 * @jest-environment node
 *
 * Tests for startScheduler() — verifies that it:
 * - loads all devices from the DB and creates one interval per device
 * - sets up heartbeat, reconcile, and pruning intervals
 * - shutdown() drains all pending checks before returning
 */

import type { Device } from "@prisma/client";

jest.mock("@/lib/db", () => ({
  db: {
    device:          { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    deviceStatus:    { upsert: jest.fn() },
    statusHistory:   { create: jest.fn(), deleteMany: jest.fn() },
    linkEvent:       { deleteMany: jest.fn() },
    tokenBlacklist:  { deleteMany: jest.fn() },
    link:            { findMany: jest.fn(), update: jest.fn() },
    workerHeartbeat: { upsert: jest.fn() },
    systemConfig:    { upsert: jest.fn(), update: jest.fn() },
    $transaction:    jest.fn(),
  },
}));

jest.mock("@/worker/monitors/ping",         () => ({ checkPing:        jest.fn() }));
jest.mock("@/worker/monitors/http",         () => ({ checkHttp:        jest.fn() }));
jest.mock("@/worker/monitors/snmp",         () => ({ checkSnmp:        jest.fn() }));
jest.mock("@/worker/monitors/routeros",     () => ({ checkRouterOS:    jest.fn() }));
jest.mock("@/worker/monitors/unifi",        () => ({ checkUnifi:       jest.fn() }));
jest.mock("@/worker/monitors/omada",        () => ({ checkOmada:       jest.fn() }));
jest.mock("@/worker/monitors/link-traffic", () => ({ checkLinkTraffic: jest.fn() }));
jest.mock("@/worker/monitors/alert",        () => ({ sendAlert: jest.fn(), isCooldownActive: jest.fn().mockReturnValue(true) }));
jest.mock("@/lib/crypto", () => ({
  resolveRouterosCredentials: jest.fn().mockReturnValue(null),
  resolveSnmpCommunity:       jest.fn().mockReturnValue("public"),
  resolveUnifiApiKey:         jest.fn().mockReturnValue(null),
  resolveUnifiCredentials:    jest.fn().mockReturnValue(null),
  resolveOmadaCredentials:    jest.fn().mockReturnValue(null),
}));

import { db } from "@/lib/db";
import { checkPing } from "@/worker/monitors/ping";
import { startScheduler, shutdown } from "@/worker/scheduler";

const mockDb       = db as jest.Mocked<typeof db>;
const mockCheckPing = checkPing as jest.Mock;

const makeDevice = (id: string, overrides: Partial<Device> = {}): Device => ({
  id,
  name:            `Device ${id}`,
  ip:              `10.0.0.${id}`,
  type:            "GENERIC",
  location:        null,
  notes:           null,
  pingEnabled:     true,
  httpEnabled:     false,
  httpPort:        null,
  httpPath:        "/",
  snmpEnabled:     false,
  snmpCommunity:   "public",
  snmpCommunityEnc: null,
  snmpPort:        161,
  routerosEnabled: false,
  routerosUserEnc: null,
  routerosPassEnc: null,
  routerosPort:    8728,
  unifiEnabled:      false,
  unifiAuthMethod:   "apikey",
  unifiApiKeyEnc:    null,
  unifiUserEnc:      null,
  unifiPassEnc:      null,
  unifiPort:         443,
  unifiSite:         "default",
  unifiTlsVerify:    false,
  unifiControllerIp: null,
  omadaEnabled:         false,
  omadaClientIdEnc:     null,
  omadaClientSecretEnc: null,
  omadacId:             null,
  omadaSite:            null,
  omadaSiteId:          null,
  omadaTlsVerify:       true,
  omadaControllerIp:    null,
  checkInterval:   60,
  maintenanceUntil: null,
  alertWebhookUrl: null,
  alertThreshold:  3,
  lastAlertAt:     null,
  createdAt:       new Date("2026-01-01"),
  updatedAt:       new Date("2026-01-01"),
  ...overrides,
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});

  (mockDb.$transaction as jest.Mock).mockResolvedValue([]);
  (mockDb.deviceStatus.upsert as jest.Mock).mockResolvedValue({});
  (mockDb.statusHistory.create as jest.Mock).mockResolvedValue({});
  (mockDb.statusHistory.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
  (mockDb.linkEvent.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
  (mockDb.tokenBlacklist.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
  (mockDb.link.findMany as jest.Mock).mockResolvedValue([]);
  (mockDb.workerHeartbeat.upsert as jest.Mock).mockResolvedValue({});
  (mockDb.systemConfig.upsert as jest.Mock).mockResolvedValue({
    id: 1, statusHistoryDays: 30, linkEventDays: 90, lastCleanupAt: null,
  });
  (mockDb.systemConfig.update as jest.Mock).mockResolvedValue({});
  mockCheckPing.mockResolvedValue({ alive: true, responseMs: 5 });
});

afterEach(async () => {
  // Switch to real timers first so shutdown's internal deadline setTimeout fires correctly
  jest.useRealTimers();
  await shutdown(200);
  jest.restoreAllMocks();
});

describe("startScheduler", () => {
  it("loads devices from the database on startup", async () => {
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([]);

    await startScheduler();

    expect(mockDb.device.findMany).toHaveBeenCalledTimes(1);
  });

  it("runs an initial check for each device immediately on startup", async () => {
    const devices = [makeDevice("1"), makeDevice("2")];
    (mockDb.device.findMany as jest.Mock).mockResolvedValue(devices);

    await startScheduler();

    // The initial safeRun() is triggered immediately (not via interval) — flush microtasks
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(mockCheckPing).toHaveBeenCalledWith("10.0.0.1");
    expect(mockCheckPing).toHaveBeenCalledWith("10.0.0.2");
  });

  it("fires the heartbeat interval after 60s", async () => {
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([]);

    await startScheduler();
    jest.advanceTimersByTime(60_000);
    await Promise.resolve();

    // workerHeartbeat.upsert called at startup (1x) + after 60s interval (2x)
    expect(mockDb.workerHeartbeat.upsert).toHaveBeenCalledTimes(2);
  });

  it("fires the reconcile interval after 30s and re-queries device snapshots", async () => {
    (mockDb.device.findMany as jest.Mock)
      .mockResolvedValueOnce([]) // initial load
      .mockResolvedValue([]);    // reconcile lean select

    await startScheduler();
    jest.advanceTimersByTime(30_000);
    await Promise.resolve();
    await Promise.resolve();

    // Second findMany is the reconcile lean select
    expect(mockDb.device.findMany).toHaveBeenCalledTimes(2);
  });

  it("reconcile fetches new/changed devices in a single batched findMany (no N+1)", async () => {
    const newDevice = makeDevice("99");
    (mockDb.device.findMany as jest.Mock)
      .mockResolvedValueOnce([])                  // initial load (no devices)
      .mockResolvedValueOnce([{ id: "99", name: "Device 99", updatedAt: new Date("2026-01-02") }]) // reconcile lean select
      .mockResolvedValueOnce([newDevice]);        // batched fetch of the new device

    await startScheduler();
    await jest.advanceTimersByTimeAsync(30_000);
    await Promise.resolve();

    // 3 findMany total: initial + lean snapshot + ONE batched fetch (not one per device)
    expect(mockDb.device.findMany).toHaveBeenCalledTimes(3);
    expect(mockDb.device.findUnique).not.toHaveBeenCalled();
    const batchCall = (mockDb.device.findMany as jest.Mock).mock.calls[2][0];
    expect(batchCall.where.id.in).toEqual(["99"]);
  });

  it("schedules repeated checks using the device checkInterval", async () => {
    const device = makeDevice("1", { checkInterval: 30 }); // 30s interval
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([device]);

    await startScheduler();

    // Flush initial immediate check
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    // Advance one full interval — triggers the second check via setInterval
    await jest.advanceTimersByTimeAsync(30_000);
    await Promise.resolve();

    expect(mockCheckPing).toHaveBeenCalledTimes(2);
  });
});

describe("shutdown drain", () => {
  it("resolves after pending checks complete", async () => {
    let resolveCheck!: () => void;
    const longCheck = new Promise<void>((r) => { resolveCheck = r; });
    mockCheckPing.mockReturnValueOnce(longCheck);

    const device = makeDevice("1");
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([device]);

    await startScheduler();
    await Promise.resolve(); // allow safeRun to start

    // Switch to real timers so shutdown's internal setTimeout fires naturally
    jest.useRealTimers();
    const shutdownPromise = shutdown(500);

    // Resolve the long-running check before the timeout
    resolveCheck();
    await expect(shutdownPromise).resolves.toBeUndefined();
  });

  it("resolves via deadline when pending checks never finish", async () => {
    // Never-resolving check
    mockCheckPing.mockReturnValueOnce(new Promise(() => {}));

    const device = makeDevice("1");
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([device]);

    await startScheduler();
    await Promise.resolve();

    // Switch to real timers so the 150ms deadline actually fires
    jest.useRealTimers();
    await expect(shutdown(150)).resolves.toBeUndefined();
  });

  it("is idempotent — calling shutdown twice does not throw", async () => {
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([]);

    await startScheduler();

    jest.useRealTimers();
    await shutdown(100);
    await expect(shutdown(100)).resolves.toBeUndefined();
  });

  it("clears intervals so interval-triggered checks stop after shutdown", async () => {
    const device = makeDevice("1", { checkInterval: 30 }); // 30s interval
    (mockDb.device.findMany as jest.Mock).mockResolvedValue([device]);

    await startScheduler();

    // Flush initial immediate check
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    // Advance one interval to confirm the interval fires
    await jest.advanceTimersByTimeAsync(30_000);
    await Promise.resolve();

    const callsAfterOneInterval = mockCheckPing.mock.calls.length; // should be 2

    // Shutdown with real timers so the deadline setTimeout fires
    jest.useRealTimers();
    await shutdown(200);

    // Restart fake timers and advance — no new checks should fire
    jest.useFakeTimers();
    jest.advanceTimersByTime(90_000);
    await Promise.resolve();

    expect(mockCheckPing.mock.calls.length).toBe(callsAfterOneInterval);
  });
});
