import { db } from "../lib/db";
import { checkPing } from "./monitors/ping";
import { checkHttp } from "./monitors/http";
import { checkSnmp } from "./monitors/snmp";
import { checkRouterOS } from "./monitors/routeros";
import { checkUnifi } from "./monitors/unifi";
import { checkOmada } from "./monitors/omada";
import { checkLinkTraffic } from "./monitors/link-traffic";
import { resolveRouterosCredentials, resolveUnifiApiKey, resolveUnifiCredentials, resolveOmadaCredentials } from "../lib/crypto";
import { log } from "../lib/logger";
import type { Device, Link } from "@prisma/client";

const RETENTION_DAYS = 30;

const timers          = new Map<string, ReturnType<typeof setInterval>>();
const deviceSnapshots = new Map<string, Date>(); // deviceId -> last known updatedAt
const pendingChecks   = new Set<Promise<unknown>>();
const allIntervals    = new Set<ReturnType<typeof setInterval>>();

function trackAsync<T>(p: Promise<T>): Promise<T> {
  pendingChecks.add(p);
  void p.finally(() => pendingChecks.delete(p));
  return p;
}

function makeInterval(fn: () => void, ms: number) {
  const id = setInterval(fn, ms);
  allIntervals.add(id);
  return id;
}

export async function shutdown(timeoutMs = 10_000): Promise<void> {
  for (const id of allIntervals) clearInterval(id);
  allIntervals.clear();
  timers.clear();
  const deadline = new Promise<void>((r) => {
    const t = setTimeout(r, timeoutMs);
    if (typeof t === "object" && t !== null && "unref" in t) (t as NodeJS.Timeout).unref();
  });
  await Promise.race([Promise.allSettled([...pendingChecks]), deadline]);
}

export async function runChecks(device: Device) {
  const results = await Promise.allSettled([
    device.pingEnabled ? checkPing(device.ip) : Promise.resolve(null),
    device.httpEnabled
      ? checkHttp(device.ip, device.httpPort ?? 80, device.httpPath)
      : Promise.resolve(null),
    device.snmpEnabled
      ? checkSnmp(device.ip, device.snmpCommunity, device.snmpPort)
      : Promise.resolve(null),
    (() => {
      if (!device.routerosEnabled) return Promise.resolve(null);
      const creds = resolveRouterosCredentials(device);
      return creds ? checkRouterOS(device.ip, creds.user, creds.pass, device.routerosPort) : Promise.resolve(null);
    })(),
    (() => {
      if (!device.unifiEnabled) return Promise.resolve(null);
      const controllerIp = device.unifiControllerIp ?? device.ip;
      if (device.unifiAuthMethod === "userpass") {
        const creds = resolveUnifiCredentials(device);
        return creds
          ? checkUnifi(device.ip, controllerIp, { method: "userpass", username: creds.username, password: creds.password }, device.unifiPort, device.unifiSite, device.unifiTlsVerify)
          : Promise.resolve(null);
      }
      const apiKey = resolveUnifiApiKey(device);
      return apiKey
        ? checkUnifi(device.ip, controllerIp, { method: "apikey", apiKey }, device.unifiPort, device.unifiSite, device.unifiTlsVerify)
        : Promise.resolve(null);
    })(),
    (() => {
      if (!device.omadaEnabled) return Promise.resolve(null);
      const creds = resolveOmadaCredentials(device);
      if (!creds || !device.omadacId || !device.omadaSiteId) return Promise.resolve(null);
      const controllerIp = device.omadaControllerIp ?? device.ip;
      return checkOmada(device.ip, controllerIp, device.omadacId, creds.clientId, creds.clientSecret, device.omadaSiteId, device.omadaTlsVerify);
    })(),
  ]);

  const pingResult     = results[0].status === "fulfilled" ? results[0].value : null;
  const httpResult     = results[1].status === "fulfilled" ? results[1].value : null;
  const snmpResult     = results[2].status === "fulfilled" ? results[2].value : null;
  const routerosResult = results[3].status === "fulfilled" ? results[3].value : null;
  const unifiResult    = results[4].status === "fulfilled" ? results[4].value : null;
  const omadaResult    = results[5].status === "fulfilled" ? results[5].value : null;

  if (results[2].status === "rejected" && device.snmpEnabled) {
    log("error", "[SNMP] monitor falhou", {
      device: device.name, ip: device.ip,
      error: results[2].reason?.message ?? String(results[2].reason),
    });
  }
  if (results[3].status === "rejected" && device.routerosEnabled) {
    log("error", "[RouterOS] monitor falhou", {
      device: device.name, ip: device.ip,
      error: results[3].reason?.message ?? String(results[3].reason),
    });
  }
  const unifiError = results[4].status === "rejected" && device.unifiEnabled
    ? (results[4].reason?.message ?? String(results[4].reason))
    : null;
  const omadaError = results[5].status === "rejected" && device.omadaEnabled
    ? (results[5].reason?.message ?? String(results[5].reason))
    : null;

  if (unifiError) {
    log("error", "[UniFi] monitor falhou", { device: device.name, ip: device.ip, error: unifiError });
  }
  if (omadaError) {
    log("error", "[Omada] monitor falhou", { device: device.name, ip: device.ip, error: omadaError });
  }

  // Controller API results (Omada/UniFi) take precedence: if the controller reports
  // the AP, it's online even when ICMP is blocked. Ping/HTTP are fallbacks only.
  const isOnline =
    (omadaResult != null ? true : null) ??
    (unifiResult != null ? true : null) ??
    pingResult?.alive ??
    httpResult?.ok ??
    false;
  const pingMs   = pingResult?.alive ? pingResult.responseMs : null;
  const httpOk   = httpResult?.ok ?? null;

  const uptime     = routerosResult?.uptime     ?? snmpResult?.uptime     ?? unifiResult?.uptime     ?? omadaResult?.uptime     ?? null;
  const cpuLoad    = routerosResult?.cpuLoad    ?? snmpResult?.cpuLoad    ?? unifiResult?.cpuLoad    ?? omadaResult?.cpuLoad    ?? null;
  const memoryUsed = routerosResult?.memoryUsed ?? snmpResult?.memoryUsed ?? unifiResult?.memoryUsed ?? omadaResult?.memoryUsed ?? null;

  const now = new Date();

  const unifiUpdate = device.unifiEnabled
    ? unifiResult
      ? { unifiData: unifiResult as unknown as import("@prisma/client").Prisma.InputJsonValue, unifiError: null }
      : { unifiError }
    : {};

  const omadaUpdate = device.omadaEnabled
    ? omadaResult
      ? { omadaData: omadaResult as unknown as import("@prisma/client").Prisma.InputJsonValue, omadaError: null }
      : { omadaError }
    : {};

  await db.$transaction([
    db.deviceStatus.upsert({
      where: { deviceId: device.id },
      update: { isOnline, pingMs, httpOk, uptime, cpuLoad, memoryUsed, ...unifiUpdate, ...omadaUpdate, checkedAt: now },
      create: { deviceId: device.id, isOnline, pingMs, httpOk, uptime, cpuLoad, memoryUsed, ...unifiUpdate, ...omadaUpdate, checkedAt: now },
    }),
    db.statusHistory.create({
      data: { deviceId: device.id, isOnline, pingMs, cpuLoad, memoryUsed, timestamp: now },
    }),
  ]);

  if (omadaResult) {
    log("info", `${isOnline ? "✓" : "✗"} ${device.name}`, {
      ip: device.ip,
      clients: omadaResult.totalClients,
      ssids: omadaResult.ssids.length,
    });
  } else if (unifiResult) {
    log("info", `${isOnline ? "✓" : "✗"} ${device.name}`, {
      ip: device.ip,
      clients: unifiResult.totalClients,
      ssids: unifiResult.ssids.length,
    });
  } else {
    log("info", `${isOnline ? "✓" : "✗"} ${device.name}`, { ip: device.ip, pingMs: pingMs ?? null });
  }
}

function scheduleDevice(device: Device) {
  const existing = timers.get(device.id);
  if (existing) {
    clearInterval(existing);
    allIntervals.delete(existing);
  }

  const intervalMs = device.checkInterval * 1000;

  void trackAsync(runChecks(device).catch(() => {}));

  const timer = makeInterval(() => void trackAsync(runChecks(device).catch(() => {})), intervalMs);
  timers.set(device.id, timer);
}

function unscheduleDevice(deviceId: string) {
  const timer = timers.get(deviceId);
  if (timer) {
    clearInterval(timer);
    allIntervals.delete(timer);
    timers.delete(deviceId);
    deviceSnapshots.delete(deviceId);
  }
}

async function runLinkChecks(link: Link & { mikrotikDevice: Device | null }) {
  if (!link.mikrotikDevice || !link.mikrotikInterface) return;

  const dev = link.mikrotikDevice;
  const creds = resolveRouterosCredentials(dev);
  if (!creds) return;

  try {
    const result = await checkLinkTraffic(
      dev.ip,
      creds.user,
      creds.pass,
      dev.routerosPort,
      link.mikrotikInterface,
    );

    await db.link.update({
      where: { id: link.id },
      data: {
        downloadBps: result.downloadBps,
        uploadBps:   result.uploadBps,
      },
    });

    log("info", `[Link] ${link.name}`, {
      downloadMbps: (result.downloadBps / 1_000_000).toFixed(1),
      uploadMbps:   (result.uploadBps   / 1_000_000).toFixed(1),
    });
  } catch (err: unknown) {
    log("error", "[Link] tráfego falhou", {
      link: link.name, ip: dev.ip, iface: link.mikrotikInterface,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function startScheduler() {
  log("info", "Worker iniciado. Carregando dispositivos...");

  const devices = await db.device.findMany();
  for (const device of devices) {
    scheduleDevice(device);
    deviceSnapshots.set(device.id, device.updatedAt);
  }
  log("info", `${devices.length} dispositivo(s) agendado(s).`);

  void trackAsync(pollLinks());

  // Run history pruning at startup then every 24h
  void trackAsync(pruneHistory());
  makeInterval(() => void trackAsync(pruneHistory()), 24 * 3_600_000);

  // Heartbeat: lets /api/health detect if the worker has stopped
  const updateHeartbeat = () =>
    db.workerHeartbeat
      .upsert({ where: { id: 1 }, update: {}, create: { id: 1, seenAt: new Date() } })
      .catch(() => {});
  void updateHeartbeat();
  makeInterval(updateHeartbeat, 60_000);

  // Reconcile device list every 30s: add new, remove deleted, reschedule updated
  // Uses a lean select for change detection; fetches full device only when needed.
  makeInterval(async () => {
    const snapshots = await db.device.findMany({
      select: { id: true, name: true, updatedAt: true },
    });
    const currentIds = new Set(snapshots.map((d) => d.id));

    for (const id of timers.keys()) {
      if (!currentIds.has(id)) {
        unscheduleDevice(id);
        log("info", "Dispositivo removido do agendador.", { deviceId: id });
      }
    }

    for (const snap of snapshots) {
      const isNew = !timers.has(snap.id);
      const lastUpdatedAt = deviceSnapshots.get(snap.id);
      const configChanged = !!lastUpdatedAt && lastUpdatedAt.getTime() !== snap.updatedAt.getTime();

      if (isNew || configChanged) {
        const device = await db.device.findUnique({ where: { id: snap.id } });
        if (!device) continue;
        scheduleDevice(device);
        deviceSnapshots.set(device.id, device.updatedAt);
        log("info", isNew ? "Novo dispositivo adicionado." : "Dispositivo atualizado, reagendando.", {
          device: device.name,
        });
      }
    }
  }, 30_000);

  makeInterval(() => void trackAsync(pollLinks()), 60_000);
}

export async function pollLinks() {
  const links = await db.link.findMany({
    where: { mikrotikDeviceId: { not: null }, mikrotikInterface: { not: null } },
    include: { mikrotikDevice: true },
  });

  await Promise.allSettled(links.map(runLinkChecks));
}

export async function pruneHistory() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 3_600_000);
  const [statusResult, eventResult] = await Promise.all([
    db.statusHistory.deleteMany({ where: { timestamp: { lt: cutoff } } }),
    db.linkEvent.deleteMany({ where: { timestamp: { lt: cutoff } } }),
  ]);
  log("info", "[Retenção] registros removidos.", {
    statusHistory: statusResult.count,
    linkEvents: eventResult.count,
    cutoff: cutoff.toISOString(),
  });
}
