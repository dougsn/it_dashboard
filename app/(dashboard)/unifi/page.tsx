"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/topbar";
import { StatusBadge } from "@/components/status-badge";
import { formatUptime, formatBps, timeAgo, fmtDateTime } from "@/lib/format";
import {
  Wifi, Users, Cpu, MemoryStick, Clock, ArrowDownToLine, ArrowUpFromLine,
  ChevronDown, ChevronUp, AlertTriangle, Radio, ExternalLink, ArrowUpDown, RefreshCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface UnifiSSID {
  ssid: string;
  band: string;
  channel: number;
  clients: number;
  txBytes: number;
  rxBytes: number;
}

interface UnifiClient {
  id: string;
  name: string;
  mac: string;
  ip: string | null;
  connectedAt: string | null;
  signal: number | null;
  ssid: string | null;
}

interface UnifiData {
  model: string | null;
  firmware: string | null;
  uptime: number | null;
  cpuLoad: number | null;
  memoryUsed: number | null;
  uplinkTxBps: number | null;
  uplinkRxBps: number | null;
  totalClients: number;
  ssids: UnifiSSID[];
  clients: UnifiClient[];
}

interface DeviceStatus {
  isOnline: boolean;
  pingMs: number | null;
  unifiData: UnifiData | null;
  unifiError: string | null;
  checkedAt: string;
}

interface UnifiDevice {
  id: string;
  name: string;
  ip: string;
  location: string | null;
  unifiAuthMethod: string | null;
  currentStatus: DeviceStatus | null;
}

type ClientSortKey = "name" | "signal" | "connectedAt";

// ── Helpers ────────────────────────────────────────────────────────────────────

function SignalCell({ signal }: { signal: number | null }) {
  if (signal == null) return <span className="text-muted-foreground">—</span>;
  const color = signal >= -60 ? "text-success" : signal >= -75 ? "text-warning" : "text-destructive";
  return <span className={`font-mono font-semibold ${color}`}>{signal} dBm</span>;
}

function MetricPill({ icon: Icon, value, color }: { icon: React.ElementType; value: string; color: string }) {
  return (
    <span className="flex items-center gap-1 text-xs font-mono">
      <Icon className={`h-3 w-3 ${color}`} />
      {value}
    </span>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1_048_576)     return `${(bytes / 1_024).toFixed(1)} KB`;
  if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
}

// ── AP Card ────────────────────────────────────────────────────────────────────

function APCard({ device }: { device: UnifiDevice }) {
  const status      = device.currentStatus;
  const data        = status?.unifiData ?? null;
  const error       = status?.unifiError ?? null;
  const isOnline    = status?.isOnline ?? false;
  const isInformApi = device.unifiAuthMethod === "userpass";

  const weakClients = isInformApi
    ? (data?.clients ?? []).filter(c => c.signal != null && c.signal < -80)
    : [];
  const hasCpuAlert = (data?.cpuLoad ?? 0) > 80;
  const hasMemAlert = (data?.memoryUsed ?? 0) > 85;

  const [clientsOpen, setClientsOpen] = useState(!isOnline && (data?.clients.length ?? 0) > 0);
  const [ssidsOpen, setSsidsOpen] = useState(false);
  const [sortKey, setSortKey] = useState<ClientSortKey>("signal");

  const sortedClients = [...(data?.clients ?? [])].sort((a, b) => {
    if (sortKey === "name")        return a.name.localeCompare(b.name);
    if (sortKey === "connectedAt") return new Date(b.connectedAt ?? 0).getTime() - new Date(a.connectedAt ?? 0).getTime();
    return (b.signal ?? -200) - (a.signal ?? -200);
  });

  function SortBtn({ col, label }: { col: ClientSortKey; label: string }) {
    return (
      <button
        onClick={() => setSortKey(col)}
        className={`flex items-center gap-1 hover:text-foreground transition-colors ${
          sortKey === col ? "text-foreground font-semibold" : "text-muted-foreground"
        }`}
      >
        {label}<ArrowUpDown className="h-3 w-3" />
      </button>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b bg-muted/20">
        <div className="flex items-start gap-3 min-w-0">
          <Wifi className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base leading-tight">{device.name}</span>
              <StatusBadge isOnline={isOnline} />
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{device.ip}</span>
              {device.location && (
                <span className="text-xs text-muted-foreground">· {device.location}</span>
              )}
              {data?.model && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {data.model}
                </Badge>
              )}
              {data?.firmware && (
                <span className="text-[10px] text-muted-foreground font-mono">fw {data.firmware}</span>
              )}
              {isInformApi && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Inform API</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {status?.checkedAt && (
            <span className="text-[10px] text-muted-foreground">{timeAgo(status.checkedAt)}</span>
          )}
          <Link
            href={`/devices/${device.id}`}
            className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1"}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Detalhes
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 px-5 py-2.5 bg-destructive/5 border-b border-destructive/20 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
          <span className="text-destructive">{error}</span>
        </div>
      )}

      {/* CPU / mem alert */}
      {(hasCpuAlert || hasMemAlert) && (
        <div className="flex items-start gap-2 px-5 py-2.5 bg-destructive/5 border-b border-destructive/20 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
          <span className="text-destructive">
            {[
              hasCpuAlert && `CPU em ${data!.cpuLoad!.toFixed(0)}% — acima do limite`,
              hasMemAlert && `Memória em ${data!.memoryUsed!.toFixed(0)}% — risco de instabilidade`,
            ].filter(Boolean).join(" · ")}
          </span>
        </div>
      )}

      {/* Weak signal alert — only with signal data (Inform API) */}
      {weakClients.length > 0 && (
        <div className="flex items-start gap-2 px-5 py-2.5 bg-warning/5 border-b border-warning/20 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
          <span className="text-warning">
            {weakClients.length} cliente{weakClients.length !== 1 ? "s" : ""} com sinal fraco (&lt; -80 dBm):{" "}
            {weakClients.map(c => `${c.name} (${c.signal} dBm)`).join(", ")}
          </span>
        </div>
      )}

      {/* Metrics */}
      {data && (
        <div className="px-5 py-3 flex flex-wrap gap-x-6 gap-y-2 border-b">
          <MetricPill icon={Users}           value={`${data.totalClients} clientes`}           color="text-[var(--chart-5)]" />
          <MetricPill icon={ArrowDownToLine} value={formatBps(data.uplinkRxBps) + " ↓"}       color="text-[var(--chart-2)]" />
          <MetricPill icon={ArrowUpFromLine} value={formatBps(data.uplinkTxBps) + " ↑"}       color="text-[var(--chart-3)]" />
          {data.cpuLoad    != null && <MetricPill icon={Cpu}         value={`CPU ${data.cpuLoad.toFixed(0)}%`}     color="text-warning" />}
          {data.memoryUsed != null && <MetricPill icon={MemoryStick} value={`Mem ${data.memoryUsed.toFixed(0)}%`} color="text-[var(--chart-4)]" />}
          {data.uptime     != null && <MetricPill icon={Clock}       value={formatUptime(data.uptime)}            color="text-success" />}
        </div>
      )}

      {/* SSIDs collapsible */}
      {data && data.ssids.length > 0 && (
        <div className="border-b">
          <button
            onClick={() => setSsidsOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-sky-500" aria-hidden="true" />
              Redes Wi-Fi
              <Badge variant="secondary" className="text-[10px]">{data.ssids.length}</Badge>
            </span>
            {ssidsOpen ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
          {ssidsOpen && (
            <div className="overflow-x-auto border-t">
              <table className="w-full text-xs" aria-label="Redes Wi-Fi (SSIDs)">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-5 py-2 font-medium text-muted-foreground">SSID</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Banda</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Canal</th>
                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">Clientes</th>
                    {isInformApi && <th className="text-right px-4 py-2 font-medium text-muted-foreground">RX</th>}
                    {isInformApi && <th className="text-right px-5 py-2 font-medium text-muted-foreground">TX</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.ssids.map((s, i) => (
                    <tr key={i} className="hover:bg-muted/10">
                      <td className="px-5 py-2 font-semibold">{s.ssid}</td>
                      <td className="px-4 py-2">
                        <Badge variant="secondary" className="text-[10px] font-mono">{s.band}</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-muted-foreground">
                        {s.channel > 0 ? `ch ${s.channel}` : "—"}
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{s.clients}</td>
                      {isInformApi && <td className="px-4 py-2 text-right font-mono text-muted-foreground">{formatBytes(s.rxBytes)}</td>}
                      {isInformApi && <td className="px-5 py-2 text-right font-mono text-muted-foreground">{formatBytes(s.txBytes)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Clients collapsible */}
      {data && data.clients.length > 0 && (
        <div>
          <button
            onClick={() => setClientsOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              Clientes conectados
              <Badge variant="secondary" className="text-[10px]">{data.clients.length}</Badge>
            </span>
            {clientsOpen ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
          {clientsOpen && (
            <div className="overflow-x-auto border-t">
              <table className="w-full text-xs" aria-label="Clientes UniFi conectados">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-5 py-2.5 text-left"><SortBtn col="name" label="Nome / MAC" /></th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">IP</th>
                    {isInformApi && <th className="px-4 py-2.5 text-left"><SortBtn col="signal" label="Sinal" /></th>}
                    {isInformApi && <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">SSID</th>}
                    {isInformApi && <th className="px-4 py-2.5 text-left"><SortBtn col="connectedAt" label="Conectado em" /></th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedClients.map(c => (
                    <tr key={c.id} className="hover:bg-muted/10">
                      <td className="px-5 py-2">
                        <p className="font-semibold truncate max-w-40" title={c.name}>{c.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{c.mac}</p>
                      </td>
                      <td className="px-4 py-2 font-mono text-muted-foreground">{c.ip ?? "—"}</td>
                      {isInformApi && <td className="px-4 py-2"><SignalCell signal={c.signal} /></td>}
                      {isInformApi && <td className="px-4 py-2 text-muted-foreground">{c.ssid ?? "—"}</td>}
                      {isInformApi && (
                        <td className="px-4 py-2 font-mono text-muted-foreground">
                          {c.connectedAt ? fmtDateTime(c.connectedAt) : "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* No data state */}
      {!data && !error && (
        <div className="px-5 py-4 text-xs text-muted-foreground">
          Aguardando primeira coleta...
        </div>
      )}
    </div>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl border bg-card px-5 py-4 space-y-1">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-extrabold font-mono ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function UnifiPage() {
  const [devices,    setDevices]    = useState<UnifiDevice[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/devices?type=UNIFI_AP");
      if (res.ok) setDevices(await res.json());
    } catch (err) {
      console.error("[unifi] falha ao carregar dispositivos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleCheckAll() {
    setIsChecking(true);
    await fetch("/api/devices/check?type=UNIFI_AP", { method: "POST" }).catch(() => {});
    await load();
    setIsChecking(false);
  }

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const online       = devices.filter(d => d.currentStatus?.isOnline).length;
  const offline      = devices.length - online;
  const withData     = devices.filter(d => d.currentStatus?.unifiData);
  const totalClients = withData.reduce((s, d) => s + (d.currentStatus?.unifiData?.totalClients ?? 0), 0);
  const avgCpu       = withData.length
    ? withData.reduce((s, d) => s + (d.currentStatus?.unifiData?.cpuLoad ?? 0), 0) / withData.length
    : null;
  const avgMem       = withData.length
    ? withData.reduce((s, d) => s + (d.currentStatus?.unifiData?.memoryUsed ?? 0), 0) / withData.length
    : null;

  return (
    <>
      <Topbar
        title="Painel UniFi"
        subtitle={loading ? "Carregando..." : `${devices.length} AP${devices.length !== 1 ? "s" : ""} registrado${devices.length !== 1 ? "s" : ""}`}
      >
        <button
          onClick={handleCheckAll}
          disabled={isChecking}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-semibold bg-background hover:bg-muted transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Verificando..." : "Atualizar todos"}
        </button>
      </Topbar>

      <div className="p-7 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            label="Online"
            value={`${online}/${devices.length}`}
            sub="APs ativos"
            color={offline > 0 ? "text-warning" : "text-success"}
          />
          <KpiCard
            label="Clientes"
            value={String(totalClients)}
            sub="em todos os APs"
            color="text-[var(--chart-5)]"
          />
          <KpiCard
            label="CPU média"
            value={avgCpu != null ? `${avgCpu.toFixed(0)}%` : "—"}
            sub="APs com dados"
            color={avgCpu != null && avgCpu > 70 ? "text-destructive" : avgCpu != null && avgCpu > 40 ? "text-warning" : "text-success"}
          />
          <KpiCard
            label="Mem média"
            value={avgMem != null ? `${avgMem.toFixed(0)}%` : "—"}
            sub="APs com dados"
            color={avgMem != null && avgMem > 85 ? "text-destructive" : avgMem != null && avgMem > 60 ? "text-warning" : "text-success"}
          />
        </div>

        {/* AP cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="rounded-xl border bg-card h-24 animate-pulse" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="rounded-xl border bg-card px-6 py-12 text-center">
            <Wifi className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">Nenhum AP UniFi registrado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione um dispositivo do tipo <strong>UniFi AP</strong> para visualizar o painel.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...devices]
              .sort((a, b) => {
                const aOn = a.currentStatus?.isOnline ?? false;
                const bOn = b.currentStatus?.isOnline ?? false;
                if (aOn !== bOn) return aOn ? 1 : -1;
                return a.name.localeCompare(b.name);
              })
              .map(d => <APCard key={d.id} device={d} />)}
          </div>
        )}
      </div>
    </>
  );
}
