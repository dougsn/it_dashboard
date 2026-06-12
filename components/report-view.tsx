"use client";

import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { CheckCircle2, AlertTriangle, AlertCircle, Wifi, Radio, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { formatDuration } from "@/lib/format";
import type { DeviceReport, ReportInsight } from "@/app/api/reports/route";
import type { DeviceType } from "@prisma/client";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<DeviceType, string> = {
  MIKROTIK: "Mikrotik RouterOS",
  DVR: "DVR",
  CAMERA: "Câmera IP",
  OTHER: "Outro",
  UNIFI_AP: "UniFi Access Point",
  OMADA_AP: "Omada AP (TP-Link)",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtBps(bps: number) {
  if (bps < 1_000) return `${bps} bps`;
  if (bps < 1_000_000) return `${(bps / 1_000).toFixed(1)} Kbps`;
  if (bps < 1_000_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
}

// ── Insight row ───────────────────────────────────────────────────────────────

function InsightRow({ insight }: { insight: ReportInsight }) {
  const cfg = {
    ok:       { Icon: CheckCircle2, color: "text-emerald-600",  bg: "bg-emerald-50 border-emerald-200" },
    warn:     { Icon: AlertTriangle, color: "text-amber-600",   bg: "bg-amber-50 border-amber-200" },
    critical: { Icon: AlertCircle,  color: "text-red-600",      bg: "bg-red-50 border-red-200" },
  }[insight.level];

  return (
    <div className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border text-sm ${cfg.bg}`}>
      <cfg.Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
      <span className="text-gray-800">{insight.text}</span>
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="border rounded-lg p-4 bg-white text-center space-y-1 print:border-gray-300">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-extrabold tabular-nums ${accent ?? "text-gray-900"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ── Ping chart ────────────────────────────────────────────────────────────────

function PingChart({ data }: { data: { timestamp: string; pingMs: number | null; isOnline: boolean }[] }) {
  const formatted = data.map(d => ({
    t: fmtDateShort(d.timestamp) + " " + fmtTime(d.timestamp),
    ping: d.isOnline ? d.pingMs : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="t" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10 }} unit="ms" width={45} />
        <Tooltip
          formatter={(v) => [`${v}ms`, "Ping"]}
          contentStyle={{ fontSize: 12 }}
        />
        <Line
          type="monotone" dataKey="ping" stroke="#6d5cf6" strokeWidth={1.5}
          dot={false} connectNulls={false} name="Ping (ms)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── RouterOS charts ───────────────────────────────────────────────────────────

function RouterosCharts({ data }: { data: { timestamp: string; cpuLoad: number | null; memoryUsed: number | null }[] }) {
  const formatted = data.map(d => ({
    t: fmtDateShort(d.timestamp) + " " + fmtTime(d.timestamp),
    cpu: d.cpuLoad != null ? +d.cpuLoad.toFixed(1) : null,
    mem: d.memoryUsed != null ? +d.memoryUsed.toFixed(1) : null,
  }));

  return (
    <div className="grid grid-cols-2 gap-4 print:gap-6">
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">CPU (%)</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" width={38} />
            <Tooltip formatter={(v) => [`${v}%`, "CPU"]} contentStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="cpu" stroke="#f59e0b" strokeWidth={1.5} fill="url(#cpuGrad)" connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Memória (%)</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="t" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" width={38} />
            <Tooltip formatter={(v) => [`${v}%`, "Memória"]} contentStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="mem" stroke="#3b82f6" strokeWidth={1.5} fill="url(#memGrad)" connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Incidents table ───────────────────────────────────────────────────────────

function IncidentsTable({ incidents }: { incidents: DeviceReport["incidents"] }) {
  if (incidents.length === 0) {
    return (
      <div className="flex items-center gap-2 py-6 justify-center text-sm text-gray-400">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        Nenhum incidente no período.
      </div>
    );
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-2 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Início</th>
          <th className="text-left py-2 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Fim</th>
          <th className="text-left py-2 pr-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Duração</th>
          <th className="text-left py-2 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
        </tr>
      </thead>
      <tbody>
        {incidents.map((inc, i) => (
          <tr key={i} className="border-b border-gray-100 last:border-0">
            <td className="py-2 pr-4 font-mono text-xs">{fmtDate(inc.startAt)}</td>
            <td className="py-2 pr-4 font-mono text-xs">{inc.endAt ? fmtDate(inc.endAt) : "—"}</td>
            <td className="py-2 pr-4 font-mono text-xs font-semibold">
              {inc.durationMs != null ? formatDuration(inc.durationMs) : "Em andamento"}
            </td>
            <td className="py-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                inc.resolved
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {inc.resolved ? "Resolvido" : "Em aberto"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Omada section ─────────────────────────────────────────────────────────────

interface OmadaData {
  model?: string | null;
  firmware?: string | null;
  uptime?: number | null;
  cpuLoad?: number | null;
  memoryUsed?: number | null;
  uplinkTxBps?: number | null;
  uplinkRxBps?: number | null;
  totalClients?: number;
  ssids?: { ssid: string; band: string; channel: string | null; clients: number }[];
  clients?: {
    id: string;
    name: string;
    mac: string;
    ip: string | null;
    signal: number | null;
    snr: number | null;
    ssid: string | null;
    band: string | null;
    wifiMode: number | null;
    uptime: number | null;
  }[];
}

function wifiGenLabel(mode: number | null): string {
  if (mode != null && mode >= 4 && mode <= 7) return `Wi-Fi ${mode}`;
  return "—";
}

function fmtUptimeSec(seconds: number | null): string {
  if (seconds == null) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function OmadaSection({ data, showClients }: { data: OmadaData; showClients: boolean }) {
  return (
    <div className="space-y-4">
      {/* Hardware info */}
      <div className="grid grid-cols-3 gap-3">
        {data.model && <div className="border rounded-lg p-3 bg-white print:border-gray-300">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Modelo</p>
          <p className="font-bold text-gray-900 mt-0.5">{data.model}</p>
        </div>}
        {data.firmware && <div className="border rounded-lg p-3 bg-white print:border-gray-300">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Firmware</p>
          <p className="font-bold text-gray-900 mt-0.5">{data.firmware}</p>
        </div>}
        {data.totalClients != null && <div className="border rounded-lg p-3 bg-white print:border-gray-300">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Clientes ativos</p>
          <p className="font-bold text-gray-900 mt-0.5">{data.totalClients}</p>
        </div>}
      </div>

      {/* Uplink */}
      {(data.uplinkTxBps != null || data.uplinkRxBps != null) && (
        <div className="flex gap-4">
          {data.uplinkRxBps != null && (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white print:border-gray-300">
              <ArrowDownToLine className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Download</p>
                <p className="font-bold">{fmtBps(data.uplinkRxBps)}</p>
              </div>
            </div>
          )}
          {data.uplinkTxBps != null && (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white print:border-gray-300">
              <ArrowUpFromLine className="h-4 w-4 text-violet-500" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Upload</p>
                <p className="font-bold">{fmtBps(data.uplinkTxBps)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SSIDs */}
      {data.ssids && data.ssids.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SSIDs ativos</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">SSID</th>
                <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Banda</th>
                <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Canal</th>
                <th className="text-left py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Clientes</th>
              </tr>
            </thead>
            <tbody>
              {data.ssids.map((s, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 pr-4 font-semibold flex items-center gap-1.5">
                    <Wifi className="h-3 w-3 text-orange-500" />{s.ssid}
                  </td>
                  <td className="py-1.5 pr-4"><span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">{s.band}</span></td>
                  <td className="py-1.5 pr-4 font-mono text-xs">{s.channel ?? "—"}</td>
                  <td className="py-1.5 font-semibold">{s.clients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Clients — conditionally shown */}
      {showClients && data.clients && data.clients.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Clientes conectados ({data.clients.length})
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 pr-3 font-semibold text-gray-500 uppercase tracking-wide">Nome/MAC</th>
                <th className="text-left py-1.5 pr-3 font-semibold text-gray-500 uppercase tracking-wide">IP</th>
                <th className="text-left py-1.5 pr-3 font-semibold text-gray-500 uppercase tracking-wide">SSID / Banda</th>
                <th className="text-left py-1.5 pr-3 font-semibold text-gray-500 uppercase tracking-wide">Sinal / SNR</th>
                <th className="text-left py-1.5 pr-3 font-semibold text-gray-500 uppercase tracking-wide">Wi-Fi</th>
                <th className="text-left py-1.5 font-semibold text-gray-500 uppercase tracking-wide">Conectado há</th>
              </tr>
            </thead>
            <tbody>
              {data.clients.slice(0, 20).map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 pr-3">
                    <p className="font-semibold text-gray-800">{c.name || "—"}</p>
                    <p className="font-mono text-gray-400">{c.mac}</p>
                  </td>
                  <td className="py-1.5 pr-3 font-mono">{c.ip ?? "—"}</td>
                  <td className="py-1.5 pr-3">
                    <p className="text-gray-800">{c.ssid ?? "—"}</p>
                    {c.band && <p className="text-gray-400">{c.band}</p>}
                  </td>
                  <td className="py-1.5 pr-3">
                    {c.signal != null ? (
                      <>
                        <span className={`font-semibold ${c.signal > -70 ? "text-emerald-600" : c.signal > -80 ? "text-amber-600" : "text-red-600"}`}>
                          {c.signal} dBm
                        </span>
                        {c.snr != null && <p className="text-gray-400 text-[10px]">SNR {c.snr} dB</p>}
                      </>
                    ) : "—"}
                  </td>
                  <td className="py-1.5 pr-3 font-mono">{wifiGenLabel(c.wifiMode)}</td>
                  <td className="py-1.5 font-mono">{fmtUptimeSec(c.uptime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.clients.length > 20 && (
            <p className="text-xs text-gray-400 mt-1">+ {data.clients.length - 20} clientes não exibidos.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── UniFi section ─────────────────────────────────────────────────────────────

interface UnifiData {
  model?: string | null;
  firmware?: string | null;
  uptime?: number | null;
  cpuLoad?: number | null;
  memoryUsed?: number | null;
  uplinkTxBps?: number | null;
  uplinkRxBps?: number | null;
  totalClients?: number;
  ssids?: { ssid: string; band: string; channel: number; clients: number }[];
  clients?: { id: string; name: string; mac: string; ip: string | null; signal: number | null; ssid: string | null }[];
}

function UnifiSection({ data, showClients }: { data: UnifiData; showClients: boolean }) {
  return (
    <div className="space-y-4">
      {/* Hardware info */}
      <div className="grid grid-cols-3 gap-3">
        {data.model && <div className="border rounded-lg p-3 bg-white print:border-gray-300">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Modelo</p>
          <p className="font-bold text-gray-900 mt-0.5">{data.model}</p>
        </div>}
        {data.firmware && <div className="border rounded-lg p-3 bg-white print:border-gray-300">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Firmware</p>
          <p className="font-bold text-gray-900 mt-0.5">{data.firmware}</p>
        </div>}
        {data.totalClients != null && <div className="border rounded-lg p-3 bg-white print:border-gray-300">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Clientes ativos</p>
          <p className="font-bold text-gray-900 mt-0.5">{data.totalClients}</p>
        </div>}
      </div>

      {/* Uplink */}
      {(data.uplinkTxBps != null || data.uplinkRxBps != null) && (
        <div className="flex gap-4">
          {data.uplinkRxBps != null && (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white print:border-gray-300">
              <ArrowDownToLine className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Download</p>
                <p className="font-bold">{fmtBps(data.uplinkRxBps)}</p>
              </div>
            </div>
          )}
          {data.uplinkTxBps != null && (
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white print:border-gray-300">
              <ArrowUpFromLine className="h-4 w-4 text-violet-500" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Upload</p>
                <p className="font-bold">{fmtBps(data.uplinkTxBps)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SSIDs */}
      {data.ssids && data.ssids.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SSIDs ativos</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">SSID</th>
                <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Banda</th>
                <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Canal</th>
                <th className="text-left py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Clientes</th>
              </tr>
            </thead>
            <tbody>
              {data.ssids.map((s, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 pr-4 font-semibold flex items-center gap-1.5">
                    <Wifi className="h-3 w-3 text-sky-500" />{s.ssid}
                  </td>
                  <td className="py-1.5 pr-4"><span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">{s.band}</span></td>
                  <td className="py-1.5 pr-4 font-mono text-xs">{s.channel}</td>
                  <td className="py-1.5 font-semibold">{s.clients}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Clients — conditionally shown */}
      {showClients && data.clients && data.clients.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Clientes conectados ({data.clients.length})
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1.5 pr-3 font-semibold text-gray-500 uppercase tracking-wide">Nome/MAC</th>
                <th className="text-left py-1.5 pr-3 font-semibold text-gray-500 uppercase tracking-wide">IP</th>
                <th className="text-left py-1.5 pr-3 font-semibold text-gray-500 uppercase tracking-wide">SSID</th>
                <th className="text-left py-1.5 font-semibold text-gray-500 uppercase tracking-wide">Sinal</th>
              </tr>
            </thead>
            <tbody>
              {data.clients.slice(0, 20).map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-1.5 pr-3">
                    <p className="font-semibold text-gray-800">{c.name || "—"}</p>
                    <p className="font-mono text-gray-400">{c.mac}</p>
                  </td>
                  <td className="py-1.5 pr-3 font-mono">{c.ip ?? "—"}</td>
                  <td className="py-1.5 pr-3 text-gray-600">{c.ssid ?? "—"}</td>
                  <td className="py-1.5">
                    {c.signal != null ? (
                      <span className={`font-semibold ${c.signal > -70 ? "text-emerald-600" : c.signal > -80 ? "text-amber-600" : "text-red-600"}`}>
                        {c.signal} dBm
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.clients.length > 20 && (
            <p className="text-xs text-gray-400 mt-1">+ {data.clients.length - 20} clientes não exibidos.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children, breakBefore }: { title: string; children: React.ReactNode; breakBefore?: boolean }) {
  return (
    <>
      {breakBefore && <div className="pdf-break" style={{ height: 0, margin: 0, padding: 0 }} />}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b border-gray-200 pb-1.5">{title}</h3>
        {children}
      </div>
    </>
  );
}

// ── Device report block ───────────────────────────────────────────────────────

function DeviceBlock({ report, index, showClients }: { report: DeviceReport; index: number; showClients: boolean }) {
  const { device, period, summary, insights, pingHistory, incidents, routerosHistory, unifiSnapshot, omadaSnapshot } = report;
  const downtime = summary.totalDowntimeMs;
  const downtimeLabel = downtime > 0
    ? (downtime >= 3_600_000
        ? `${Math.floor(downtime / 3_600_000)}h ${Math.floor((downtime % 3_600_000) / 60_000)}min`
        : `${Math.floor(downtime / 60_000)}min`)
    : "—";

  return (
    <div className={`space-y-6 ${index > 0 ? "pt-10 mt-10 border-t-2 border-gray-200 print:break-before-page" : ""}`}>
      {/* Device header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-violet-600" />
            <h2 className="text-xl font-extrabold text-gray-900">{device.name}</h2>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="font-mono">{device.ip}</span>
            <span>·</span>
            <span>{TYPE_LABEL[device.type]}</span>
            {device.location && <><span>·</span><span>{device.location}</span></>}
          </div>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>{fmtDate(period.from)}</p>
          <p>até {fmtDate(period.to)}</p>
        </div>
      </div>

      {/* KPIs */}
      <Section title="Resumo executivo">
        <div className="grid grid-cols-4 gap-3">
          <KpiCard
            label="Uptime"
            value={`${summary.uptimePct.toFixed(2)}%`}
            sub={`${summary.onlineChecks}/${summary.totalChecks} verificações`}
            accent={summary.uptimePct >= 99 ? "text-emerald-600" : summary.uptimePct >= 95 ? "text-amber-600" : "text-red-600"}
          />
          <KpiCard
            label="Incidentes"
            value={String(summary.incidentCount)}
            sub={summary.incidentCount > 0 ? `Downtime: ${downtimeLabel}` : "Sem quedas"}
            accent={summary.incidentCount === 0 ? "text-emerald-600" : summary.incidentCount <= 2 ? "text-amber-600" : "text-red-600"}
          />
          <KpiCard
            label="Ping médio"
            value={summary.avgPingMs != null ? `${summary.avgPingMs}ms` : "—"}
            sub={summary.maxPingMs != null ? `máx ${summary.maxPingMs}ms` : undefined}
            accent={summary.avgPingMs == null ? undefined : summary.avgPingMs < 50 ? "text-emerald-600" : summary.avgPingMs < 150 ? "text-amber-600" : "text-red-600"}
          />
          <KpiCard
            label="Verificações"
            value={String(summary.totalChecks)}
            sub={`${period.hours}h de histórico`}
          />
        </div>
      </Section>

      {/* Insights */}
      {insights.length > 0 && (
        <Section title="Insights">
          <div className="space-y-2">
            {insights.map((ins, i) => <InsightRow key={i} insight={ins} />)}
          </div>
        </Section>
      )}

      {/* Ping chart */}
      {pingHistory.length > 1 && (
        <Section title="Latência ao longo do tempo">
          <PingChart data={pingHistory} />
        </Section>
      )}

      {/* RouterOS */}
      {routerosHistory && routerosHistory.length > 1 && (
        <Section title="Recursos do sistema (RouterOS)">
          <RouterosCharts data={routerosHistory} />
        </Section>
      )}

      {/* UniFi */}
      {unifiSnapshot != null && (
        <Section title="Dados UniFi (snapshot atual)" breakBefore>
          <UnifiSection data={unifiSnapshot as UnifiData} showClients={showClients} />
        </Section>
      )}

      {/* Omada */}
      {omadaSnapshot != null && (
        <Section title="Dados Omada (snapshot atual)" breakBefore>
          <OmadaSection data={omadaSnapshot as OmadaData} showClients={showClients} />
        </Section>
      )}

      {/* Incidents */}
      <Section title={`Timeline de incidentes (${incidents.length})`} breakBefore>
        <IncidentsTable incidents={incidents} />
      </Section>
    </div>
  );
}

// ── Public: ReportView ────────────────────────────────────────────────────────

export function ReportView({
  reports,
  generatedAt,
  showClients = true,
}: {
  reports: DeviceReport[];
  generatedAt: Date;
  showClients?: boolean;
}) {
  return (
    <div className="report-content w-full bg-white">
        {/* Report header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600 mb-1">WatchIT Tower</p>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Relatório de {reports.length === 1 ? reports[0].device.name : `${reports.length} dispositivos`}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gerado em {generatedAt.toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })}
              </p>
            </div>
            <div className="text-right text-xs text-gray-400 space-y-0.5">
              <p>{reports[0]?.period.hours}h de histórico</p>
              <p>
                {new Date(reports[0]?.period.from).toLocaleDateString("pt-BR")}
                {" → "}
                {new Date(reports[0]?.period.to).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Device sections */}
        <div className="px-8 py-8 space-y-0">
          {reports.map((report, i) => (
            <DeviceBlock key={report.device.id} report={report} index={i} showClients={showClients} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          WatchIT Tower — Relatório gerado automaticamente em {generatedAt.toLocaleString("pt-BR")}
        </div>
      </div>
  );
}
