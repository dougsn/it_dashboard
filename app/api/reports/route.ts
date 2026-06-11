import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/with-auth";
import type { DeviceType } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReportSummary {
  uptimePct: number;
  totalChecks: number;
  onlineChecks: number;
  incidentCount: number;
  totalDowntimeMs: number;
  avgPingMs: number | null;
  maxPingMs: number | null;
  minPingMs: number | null;
}

export interface ReportIncident {
  startAt: string;
  endAt: string | null;
  durationMs: number | null;
  resolved: boolean;
}

export interface ReportPingPoint {
  timestamp: string;
  pingMs: number | null;
  isOnline: boolean;
}

export interface ReportRouterosPoint {
  timestamp: string;
  cpuLoad: number | null;
  memoryUsed: number | null;
}

export interface ReportInsight {
  level: "ok" | "warn" | "critical";
  text: string;
}

export interface DeviceReport {
  device: {
    id: string;
    name: string;
    type: DeviceType;
    ip: string;
    location: string | null;
  };
  period: {
    from: string;
    to: string;
    hours: number;
  };
  summary: ReportSummary;
  insights: ReportInsight[];
  pingHistory: ReportPingPoint[];
  incidents: ReportIncident[];
  routerosHistory: ReportRouterosPoint[] | null;
  unifiSnapshot: unknown | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function downsample<T>(items: T[], maxPoints: number): T[] {
  if (items.length <= maxPoints) return items;
  const step = items.length / maxPoints;
  return Array.from({ length: maxPoints }, (_, i) => items[Math.floor(i * step)]);
}

function buildIncidents(
  history: { isOnline: boolean; timestamp: Date }[],
  since: Date
): ReportIncident[] {
  const incidents: ReportIncident[] = [];
  if (history.length === 0) return incidents;

  let incidentStart: Date | null = null;
  if (!history[0].isOnline) incidentStart = since;

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];
    if (prev.isOnline && !curr.isOnline) incidentStart = curr.timestamp;
    if (!prev.isOnline && curr.isOnline && incidentStart) {
      incidents.push({
        startAt: incidentStart.toISOString(),
        endAt: curr.timestamp.toISOString(),
        durationMs: curr.timestamp.getTime() - incidentStart.getTime(),
        resolved: true,
      });
      incidentStart = null;
    }
  }

  const last = history[history.length - 1];
  if (incidentStart && !last.isOnline) {
    incidents.push({
      startAt: incidentStart.toISOString(),
      endAt: null,
      durationMs: Date.now() - incidentStart.getTime(),
      resolved: false,
    });
  }

  return incidents;
}

function buildInsights(
  summary: ReportSummary,
  history: { isOnline: boolean; cpuLoad: number | null; memoryUsed: number | null }[],
  incidents: ReportIncident[]
): ReportInsight[] {
  const insights: ReportInsight[] = [];

  // Uptime
  if (summary.uptimePct >= 99.5) {
    insights.push({ level: "ok", text: `Uptime excelente: ${summary.uptimePct.toFixed(2)}% no período.` });
  } else if (summary.uptimePct >= 95) {
    insights.push({ level: "warn", text: `Uptime abaixo do ideal: ${summary.uptimePct.toFixed(2)}% (${summary.incidentCount} incidente${summary.incidentCount !== 1 ? "s" : ""}).` });
  } else {
    insights.push({ level: "critical", text: `Uptime crítico: ${summary.uptimePct.toFixed(2)}% — dispositivo ficou offline por ${Math.round(summary.totalDowntimeMs / 60_000)} minutos no período.` });
  }

  // Ping
  if (summary.avgPingMs != null) {
    if (summary.avgPingMs < 50) {
      insights.push({ level: "ok", text: `Latência saudável: média de ${summary.avgPingMs}ms.` });
    } else if (summary.avgPingMs < 150) {
      insights.push({ level: "warn", text: `Latência elevada: média de ${summary.avgPingMs}ms (máx ${summary.maxPingMs}ms).` });
    } else {
      insights.push({ level: "critical", text: `Latência crítica: média de ${summary.avgPingMs}ms — verifique a conectividade da rede.` });
    }
  }

  // Worst incident
  const resolved = incidents.filter(i => i.durationMs != null).sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0));
  if (resolved.length > 0) {
    const worst = resolved[0];
    const min = Math.round((worst.durationMs ?? 0) / 60_000);
    const label = min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}min` : `${min}min`;
    insights.push({ level: "warn", text: `Pior incidente: queda de ${label} em ${new Date(worst.startAt).toLocaleDateString("pt-BR")}.` });
  }

  // CPU (Mikrotik)
  const withCpu = history.filter(h => h.cpuLoad != null);
  if (withCpu.length > 0) {
    const avgCpu = withCpu.reduce((s, h) => s + (h.cpuLoad ?? 0), 0) / withCpu.length;
    const highCpu = withCpu.filter(h => (h.cpuLoad ?? 0) > 80).length;
    const highPct = (highCpu / withCpu.length) * 100;
    if (avgCpu > 70) {
      insights.push({ level: "critical", text: `CPU sobrecarregada: média de ${avgCpu.toFixed(1)}%, acima de 80% em ${highPct.toFixed(0)}% das amostras.` });
    } else if (avgCpu > 40) {
      insights.push({ level: "warn", text: `CPU moderada: média de ${avgCpu.toFixed(1)}% no período.` });
    } else {
      insights.push({ level: "ok", text: `CPU normal: média de ${avgCpu.toFixed(1)}% no período.` });
    }
  }

  // Memory (Mikrotik)
  const withMem = history.filter(h => h.memoryUsed != null);
  if (withMem.length > 0) {
    const avgMem = withMem.reduce((s, h) => s + (h.memoryUsed ?? 0), 0) / withMem.length;
    if (avgMem > 85) {
      insights.push({ level: "critical", text: `Memória crítica: uso médio de ${avgMem.toFixed(1)}% — risco de instabilidade.` });
    } else if (avgMem > 60) {
      insights.push({ level: "warn", text: `Memória moderada: uso médio de ${avgMem.toFixed(1)}% no período.` });
    } else {
      insights.push({ level: "ok", text: `Memória normal: uso médio de ${avgMem.toFixed(1)}% no período.` });
    }
  }

  return insights;
}

async function buildDeviceReport(
  deviceId: string,
  since: Date,
  to: Date,
  hours: number
): Promise<DeviceReport | null> {
  const device = await db.device.findUnique({
    where: { id: deviceId },
    include: { currentStatus: true },
  });
  if (!device) return null;

  const history = await db.statusHistory.findMany({
    where: { deviceId, timestamp: { gte: since } },
    orderBy: { timestamp: "asc" },
    select: { isOnline: true, pingMs: true, cpuLoad: true, memoryUsed: true, timestamp: true },
  });

  const totalChecks = history.length;
  const onlineChecks = history.filter(h => h.isOnline).length;
  const uptimePct = totalChecks > 0 ? (onlineChecks / totalChecks) * 100 : 100;

  const onlinePings = history.filter(h => h.isOnline && h.pingMs != null).map(h => h.pingMs!);
  const avgPingMs = onlinePings.length > 0 ? Math.round(onlinePings.reduce((s, p) => s + p, 0) / onlinePings.length) : null;
  const maxPingMs = onlinePings.length > 0 ? Math.max(...onlinePings) : null;
  const minPingMs = onlinePings.length > 0 ? Math.min(...onlinePings) : null;

  const incidents = buildIncidents(history, since);
  const totalDowntimeMs = incidents.reduce((s, i) => s + (i.durationMs ?? 0), 0);

  const summary: ReportSummary = {
    uptimePct,
    totalChecks,
    onlineChecks,
    incidentCount: incidents.length,
    totalDowntimeMs,
    avgPingMs,
    maxPingMs,
    minPingMs,
  };

  const pingHistory = downsample(
    history.map(h => ({
      timestamp: h.timestamp.toISOString(),
      pingMs: h.isOnline ? (h.pingMs ?? null) : null,
      isOnline: h.isOnline,
    })),
    400
  );

  const routerosHistory =
    device.type === "MIKROTIK"
      ? downsample(
          history.map(h => ({
            timestamp: h.timestamp.toISOString(),
            cpuLoad: h.cpuLoad ?? null,
            memoryUsed: h.memoryUsed ?? null,
          })),
          400
        )
      : null;

  const unifiSnapshot =
    device.type === "UNIFI_AP" && device.currentStatus?.unifiData
      ? device.currentStatus.unifiData
      : null;

  const insights = buildInsights(summary, history, incidents);

  return {
    device: {
      id: device.id,
      name: device.name,
      type: device.type,
      ip: device.ip,
      location: device.location,
    },
    period: { from: since.toISOString(), to: to.toISOString(), hours },
    summary,
    insights,
    pingHistory,
    incidents,
    routerosHistory,
    unifiSnapshot,
  };
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { searchParams } = new URL(req.url);
  const deviceIds = (searchParams.get("devices") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const hours = Math.min(parseInt(searchParams.get("hours") ?? "") || 168, 720);

  if (deviceIds.length === 0) {
    return NextResponse.json({ error: "Selecione pelo menos um dispositivo." }, { status: 400 });
  }
  if (deviceIds.length > 10) {
    return NextResponse.json({ error: "Máximo de 10 dispositivos por relatório." }, { status: 400 });
  }

  const since = new Date(Date.now() - hours * 3_600_000);
  const now = new Date();

  const reports = await Promise.all(deviceIds.map(id => buildDeviceReport(id, since, now, hours)));
  return NextResponse.json(reports.filter(Boolean) as DeviceReport[]);
}
