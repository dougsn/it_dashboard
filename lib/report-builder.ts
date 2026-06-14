// ARC-A005: extracted from app/api/reports/route.ts to enable independent unit testing
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { getOnlineTransitionsForDevice } from "@/lib/incident-detection";
import { getDeviceReportStats, getDeviceChartSamples } from "@/lib/report-queries";
import type { DeviceType } from "@prisma/client";

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
  omadaSnapshot: unknown | null;
  comparison?: {
    period: { from: string; to: string; hours: number };
    summary: ReportSummary;
  };
}

export function downsample<T>(items: T[], maxPoints: number): T[] {
  if (items.length <= maxPoints) return items;
  const step = items.length / maxPoints;
  return Array.from({ length: maxPoints }, (_, i) => items[Math.floor(i * step)]);
}

export function buildIncidents(
  history: { isOnline: boolean; timestamp: Date }[],
  since: Date
): ReportIncident[] {
  const incidents: ReportIncident[] = [];
  if (history.length === 0) return incidents;

  let incidentStart: Date | null = null;
  if (!history[0].isOnline) incidentStart = history[0].timestamp;

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

  void since; // parameter kept for API compatibility
  return incidents;
}

export interface ResourceMetrics {
  avgCpu: number | null;
  cpuCount: number;
  highCpu: number;
  avgMem: number | null;
  memCount: number;
}

export function buildInsights(
  summary: ReportSummary,
  metrics: ResourceMetrics,
  incidents: ReportIncident[]
): ReportInsight[] {
  const insights: ReportInsight[] = [];

  if (summary.uptimePct >= 99.5) {
    insights.push({ level: "ok", text: `Uptime excelente: ${summary.uptimePct.toFixed(2)}% no período.` });
  } else if (summary.uptimePct >= 95) {
    insights.push({ level: "warn", text: `Uptime abaixo do ideal: ${summary.uptimePct.toFixed(2)}% (${summary.incidentCount} incidente${summary.incidentCount !== 1 ? "s" : ""}).` });
  } else {
    insights.push({ level: "critical", text: `Uptime crítico: ${summary.uptimePct.toFixed(2)}% — dispositivo ficou offline por ${Math.round(summary.totalDowntimeMs / 60_000)} minutos no período.` });
  }

  if (summary.avgPingMs != null) {
    if (summary.avgPingMs < 50) {
      insights.push({ level: "ok", text: `Latência saudável: média de ${summary.avgPingMs}ms.` });
    } else if (summary.avgPingMs < 150) {
      insights.push({ level: "warn", text: `Latência elevada: média de ${summary.avgPingMs}ms (máx ${summary.maxPingMs}ms).` });
    } else {
      insights.push({ level: "critical", text: `Latência crítica: média de ${summary.avgPingMs}ms — verifique a conectividade da rede.` });
    }
  }

  const resolved = incidents.filter(i => i.durationMs != null).sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0));
  if (resolved.length > 0) {
    const worst = resolved[0];
    const min = Math.round((worst.durationMs ?? 0) / 60_000);
    const label = min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}min` : `${min}min`;
    insights.push({ level: "warn", text: `Pior incidente: queda de ${label} em ${fmtDate(worst.startAt)}.` });
  }

  if (metrics.cpuCount > 0 && metrics.avgCpu != null) {
    const avgCpu = metrics.avgCpu;
    const highPct = (metrics.highCpu / metrics.cpuCount) * 100;
    if (avgCpu > 70) {
      insights.push({ level: "critical", text: `CPU sobrecarregada: média de ${avgCpu.toFixed(1)}%, acima de 80% em ${highPct.toFixed(0)}% das amostras.` });
    } else if (avgCpu > 40) {
      insights.push({ level: "warn", text: `CPU moderada: média de ${avgCpu.toFixed(1)}% no período.` });
    } else {
      insights.push({ level: "ok", text: `CPU normal: média de ${avgCpu.toFixed(1)}% no período.` });
    }
  }

  if (metrics.memCount > 0 && metrics.avgMem != null) {
    const avgMem = metrics.avgMem;
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

export async function buildSummaryForPeriod(
  deviceId: string,
  since: Date
): Promise<ReportSummary> {
  const [stats, transitions] = await Promise.all([
    getDeviceReportStats(deviceId, since),
    getOnlineTransitionsForDevice(deviceId, since),
  ]);
  const uptimePct = stats.total > 0 ? (stats.online / stats.total) * 100 : 100;
  const avgPingMs = stats.avgPing != null ? Math.round(stats.avgPing) : null;
  const incidents = buildIncidents(transitions, since);
  const totalDowntimeMs = incidents.reduce((s, i) => s + (i.durationMs ?? 0), 0);
  return {
    uptimePct, totalChecks: stats.total, onlineChecks: stats.online,
    incidentCount: incidents.length, totalDowntimeMs,
    avgPingMs, maxPingMs: stats.maxPing, minPingMs: stats.minPing,
  };
}

export async function buildDeviceReport(
  deviceId: string,
  since: Date,
  to: Date,
  hours: number,
  compareSince?: Date,
  compareTo?: Date
): Promise<DeviceReport | null> {
  const device = await db.device.findUnique({
    where: { id: deviceId },
    include: { currentStatus: true },
  });
  if (!device) return null;

  // Stats (aggregates), incidents (transitions), and chart samples (strided) are
  // all computed in the database — the full history is never loaded into memory.
  const [stats, transitions, samples] = await Promise.all([
    getDeviceReportStats(deviceId, since),
    getOnlineTransitionsForDevice(deviceId, since),
    getDeviceChartSamples(deviceId, since, 400),
  ]);

  const totalChecks = stats.total;
  const onlineChecks = stats.online;
  const uptimePct = totalChecks > 0 ? (onlineChecks / totalChecks) * 100 : 100;

  const avgPingMs = stats.avgPing != null ? Math.round(stats.avgPing) : null;
  const maxPingMs = stats.maxPing;
  const minPingMs = stats.minPing;

  const incidents = buildIncidents(transitions, since);
  const totalDowntimeMs = incidents.reduce((s, i) => s + (i.durationMs ?? 0), 0);

  const summary: ReportSummary = {
    uptimePct, totalChecks, onlineChecks,
    incidentCount: incidents.length, totalDowntimeMs, avgPingMs, maxPingMs, minPingMs,
  };

  const pingHistory = samples.map(h => ({
    timestamp: h.timestamp.toISOString(),
    pingMs: h.isOnline ? (h.pingMs ?? null) : null,
    isOnline: h.isOnline,
  }));

  const routerosHistory =
    device.type === "MIKROTIK"
      ? samples.map(h => ({
          timestamp: h.timestamp.toISOString(),
          cpuLoad: h.cpuLoad ?? null,
          memoryUsed: h.memoryUsed ?? null,
        }))
      : null;

  const unifiSnapshot =
    device.type === "UNIFI_AP" && device.currentStatus?.unifiData
      ? device.currentStatus.unifiData
      : null;

  const omadaSnapshot =
    device.type === "OMADA_AP" && (device.currentStatus as (typeof device.currentStatus & { omadaData?: unknown }))?.omadaData
      ? (device.currentStatus as (typeof device.currentStatus & { omadaData?: unknown }))!.omadaData
      : null;

  const insights = buildInsights(
    summary,
    { avgCpu: stats.avgCpu, cpuCount: stats.cpuCount, highCpu: stats.highCpu, avgMem: stats.avgMem, memCount: stats.memCount },
    incidents,
  );

  let comparison: DeviceReport["comparison"] | undefined;
  if (compareSince && compareTo) {
    const compareHours = Math.round((compareTo.getTime() - compareSince.getTime()) / 3_600_000);
    const compareSummary = await buildSummaryForPeriod(deviceId, compareSince);
    comparison = {
      period: { from: compareSince.toISOString(), to: compareTo.toISOString(), hours: compareHours },
      summary: compareSummary,
    };
  }

  return {
    device: { id: device.id, name: device.name, type: device.type, ip: device.ip, location: device.location },
    period: { from: since.toISOString(), to: to.toISOString(), hours },
    summary, insights, pingHistory, incidents, routerosHistory, unifiSnapshot, omadaSnapshot, comparison,
  };
}
