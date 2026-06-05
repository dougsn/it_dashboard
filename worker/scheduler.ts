import { db } from "../lib/db";
import { checkPing } from "./monitors/ping";
import { checkHttp } from "./monitors/http";
import { checkSnmp } from "./monitors/snmp";
import { checkRouterOS } from "./monitors/routeros";
import { checkLinkTraffic } from "./monitors/link-traffic";
import type { Device, Link } from "@prisma/client";

const timers = new Map<string, ReturnType<typeof setInterval>>();

async function runChecks(device: Device) {
  const results = await Promise.allSettled([
    device.pingEnabled ? checkPing(device.ip) : Promise.resolve(null),
    device.httpEnabled
      ? checkHttp(device.ip, device.httpPort ?? 80, device.httpPath)
      : Promise.resolve(null),
    device.snmpEnabled
      ? checkSnmp(device.ip, device.snmpCommunity, device.snmpPort)
      : Promise.resolve(null),
    device.routerosEnabled && device.routerosUser && device.routerosPass
      ? checkRouterOS(device.ip, device.routerosUser, device.routerosPass, device.routerosPort)
      : Promise.resolve(null),
  ]);

  const pingResult = results[0].status === "fulfilled" ? results[0].value : null;
  const httpResult = results[1].status === "fulfilled" ? results[1].value : null;
  const snmpResult = results[2].status === "fulfilled" ? results[2].value : null;
  const rosResult  = results[3].status === "fulfilled" ? results[3].value : null;

  if (results[2].status === "rejected" && device.snmpEnabled) {
    console.error(`[SNMP] ${device.name} (${device.ip}):`, results[2].reason?.message ?? results[2].reason);
  }
  if (results[3].status === "rejected" && device.routerosEnabled) {
    console.error(`[RouterOS] ${device.name} (${device.ip}):`, results[3].reason?.message ?? results[3].reason);
  }

  const isOnline = pingResult?.alive ?? httpResult?.ok ?? false;
  const pingMs = pingResult?.alive ? pingResult.responseMs : null;
  const httpOk = httpResult?.ok ?? null;

  const uptime = rosResult?.uptime ?? snmpResult?.uptime ?? null;
  const cpuLoad = rosResult?.cpuLoad ?? snmpResult?.cpuLoad ?? null;
  const memoryUsed = rosResult?.memoryUsed ?? snmpResult?.memoryUsed ?? null;

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
  if (timers.has(device.id)) clearInterval(timers.get(device.id)!);

  const intervalMs = (device.checkInterval ?? 60) * 1000;

  runChecks(device).catch(() => {});

  const timer = setInterval(() => runChecks(device).catch(() => {}), intervalMs);
  timers.set(device.id, timer);
}

function unscheduleDevice(deviceId: string) {
  const timer = timers.get(deviceId);
  if (timer) {
    clearInterval(timer);
    timers.delete(deviceId);
  }
}

async function runLinkChecks(link: Link & { mikrotikDevice: Device | null }) {
  if (!link.mikrotikDevice || !link.mikrotikInterface) return;

  const dev = link.mikrotikDevice;
  if (!dev.routerosUser || !dev.routerosPass) return;

  try {
    const result = await checkLinkTraffic(
      dev.ip,
      dev.routerosUser,
      dev.routerosPass,
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
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Link] ${link.name} (${dev.ip}/${link.mikrotikInterface}):`, msg);
  }
}

export async function startScheduler() {
  console.log("Worker iniciado. Carregando dispositivos...");

  const devices = await db.device.findMany();
  devices.forEach(scheduleDevice);
  console.log(`${devices.length} dispositivo(s) agendado(s).`);

  // Initial link traffic poll
  void pollLinks();

  // Poll for device changes every 30s
  setInterval(async () => {
    const current = await db.device.findMany();
    const currentIds = new Set(current.map((d) => d.id));

    // Remove devices that were deleted
    for (const id of timers.keys()) {
      if (!currentIds.has(id)) {
        unscheduleDevice(id);
        console.log(`Dispositivo ${id} removido do agendador.`);
      }
    }

    // Add/update devices
    for (const device of current) {
      const existing = timers.get(device.id);
      if (!existing) {
        scheduleDevice(device);
        console.log(`Novo dispositivo adicionado: ${device.name}`);
      }
    }
  }, 30_000);

  // Poll link traffic every 60s
  setInterval(pollLinks, 60_000);
}

async function pollLinks() {
  const links = await db.link.findMany({
    where: { mikrotikDeviceId: { not: null }, mikrotikInterface: { not: null } },
    include: { mikrotikDevice: true },
  });

  await Promise.allSettled(links.map(runLinkChecks));
}
