import { db } from "../lib/db";
import { checkPing } from "./monitors/ping";
import { checkHttp } from "./monitors/http";
import { checkSnmp } from "./monitors/snmp";
import { checkRouterOS } from "./monitors/routeros";
import { checkLinkTraffic } from "./monitors/link-traffic";
import { resolveRouterosCredentials } from "../lib/crypto";
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
  ]);

  const pingResult     = results[0].status === "fulfilled" ? results[0].value : null;
  const httpResult     = results[1].status === "fulfilled" ? results[1].value : null;
  const snmpResult     = results[2].status === "fulfilled" ? results[2].value : null;
  const routerosResult = results[3].status === "fulfilled" ? results[3].value : null;

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

  const isOnline = pingResult?.alive ?? httpResult?.ok ?? false;
  const pingMs   = pingResult?.alive ? pingResult.responseMs : null;
  const httpOk   = httpResult?.ok ?? null;

  const uptime     = routerosResult?.uptime     ?? snmpResult?.uptime     ?? null;
  const cpuLoad    = routerosResult?.cpuLoad    ?? snmpResult?.cpuLoad    ?? null;
  const memoryUsed = routerosResult?.memoryUsed ?? snmpResult?.memoryUsed ?? null;

  const now = new Date();

  await db.$transaction([
    db.deviceStatus.upsert({
      where: { deviceId: device.id },
      update: { isOnline, pingMs, httpOk, uptime, cpuLoad, memoryUsed, checkedAt: now },
      create: { deviceId: device.id, isOnline, pingMs, httpOk, uptime, cpuLoad, memoryUsed, checkedAt: now },
    }),
    db.statusHistory.create({
      data: { deviceId: device.id, isOnline, pingMs, cpuLoad, memoryUsed, timestamp: now },
    }),
  ]);

  const status = isOnline ? "✓" : "✗";
  console.log(`[${now.toLocaleTimeString("pt-BR")}] ${status} ${device.name} (${device.ip}) — ping: ${pingMs ?? "—"}ms`);
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

    console.log(
      `[Link] ${link.name} — ↓ ${(result.downloadBps / 1_000_000).toFixed(1)} Mbps  ↑ ${(result.uploadBps / 1_000_000).toFixed(1)} Mbps`,
    );
  } catch (err: unknown) {
    log("error", "[Link] tráfego falhou", {
      link: link.name, ip: dev.ip, iface: link.mikrotikInterface,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function startScheduler() {
  console.log("Worker iniciado. Carregando dispositivos...");

  const devices = await db.device.findMany();
  for (const device of devices) {
    scheduleDevice(device);
    deviceSnapshots.set(device.id, device.updatedAt);
  }
  console.log(`${devices.length} dispositivo(s) agendado(s).`);

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
        console.log(`Dispositivo ${id} removido do agendador.`);
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
        console.log(
          isNew
            ? `Novo dispositivo adicionado: ${device.name}`
            : `Dispositivo atualizado, reagendando: ${device.name}`
        );
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
  console.log(
    `[Retenção] ${statusResult.count} registros de histórico e ${eventResult.count} eventos de link removidos (anteriores a ${cutoff.toLocaleDateString("pt-BR")}).`
  );
}
