"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/topbar";
import { StatusBadge } from "@/components/status-badge";
import { formatUptime, formatBps, formatResponseTime, timeAgo } from "@/lib/format";
import {
  Cpu, MemoryStick, Clock, Network, ExternalLink,
  AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  ChevronDown, ChevronUp, Globe, Router, Users, RefreshCw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface RouterOSClient {
  mac: string;
  ip: string;
  hostname: string | null;
  server: string | null;
}

interface DeviceStatus {
  isOnline: boolean;
  pingMs: number | null;
  httpOk: boolean | null;
  uptime: number | null;
  cpuLoad: number | null;
  memoryUsed: number | null;
  checkedAt: string;
  routerosData?: { clients: RouterOSClient[] } | null;
}

interface MikrotikDevice {
  id: string;
  name: string;
  ip: string;
  location: string | null;
  pingEnabled: boolean;
  httpEnabled: boolean;
  routerosEnabled: boolean;
  currentStatus: DeviceStatus | null;
}

interface AssociatedLink {
  id: string;
  name: string;
  location: string | null;
  isOnline: boolean;
  mikrotikInterface: string | null;
  downloadBps: number | null;
  uploadBps: number | null;
  contractedDownloadBps: number | null;
  contractedUploadBps: number | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function MetricPill({
  icon: Icon, value, color,
}: { icon: React.ElementType; value: string; color: string }) {
  return (
    <span className="flex items-center gap-1 text-xs font-mono">
      <Icon className={`h-3 w-3 ${color}`} />
      {value}
    </span>
  );
}

function CpuBar({ value }: { value: number }) {
  const color =
    value > 80 ? "bg-destructive" :
    value > 50 ? "bg-warning" :
    "bg-success";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="font-mono text-xs w-9 text-right">{value.toFixed(0)}%</span>
    </div>
  );
}

function UtilBar({ bps, contractedBps }: { bps: number | null; contractedBps: number | null }) {
  if (!bps || !contractedBps) return <span className="font-mono text-xs text-muted-foreground">{formatBps(bps)}</span>;
  const pct = Math.min((bps / contractedBps) * 100, 100);
  const color = pct > 90 ? "bg-destructive" : pct > 70 ? "bg-warning" : "bg-success";
  return (
    <div className="flex items-center gap-2 min-w-28">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-xs w-16 text-right">{formatBps(bps)}</span>
    </div>
  );
}

// ── Device Card ────────────────────────────────────────────────────────────────

function DeviceCard({
  device,
  links,
}: {
  device: MikrotikDevice;
  links: AssociatedLink[];
}) {
  const [linksOpen,   setLinksOpen]   = useState(false);
  const [clientsOpen, setClientsOpen] = useState(false);

  const status     = device.currentStatus;
  const isOnline   = status?.isOnline ?? false;
  const hasMetrics = status?.cpuLoad != null || status?.memoryUsed != null;
  const hasCpuAlert = (status?.cpuLoad ?? 0) > 80;
  const hasMemAlert = (status?.memoryUsed ?? 0) > 85;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b bg-muted/20">
        <div className="flex items-start gap-3 min-w-0">
          <Router className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
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
              {device.routerosEnabled && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">RouterOS API</Badge>
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

      {/* CPU / mem alert */}
      {(hasCpuAlert || hasMemAlert) && (
        <div className="flex items-start gap-2 px-5 py-2.5 bg-destructive/5 border-b border-destructive/20 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
          <span className="text-destructive">
            {[
              hasCpuAlert && `CPU em ${status!.cpuLoad!.toFixed(0)}% — acima do limite`,
              hasMemAlert && `Memória em ${status!.memoryUsed!.toFixed(0)}% — risco de instabilidade`,
            ].filter(Boolean).join(" · ")}
          </span>
        </div>
      )}

      {/* Metrics row */}
      <div className="px-5 py-3 flex flex-wrap gap-x-6 gap-y-2 border-b">
        {status?.pingMs != null && (
          <MetricPill icon={Network}     value={formatResponseTime(status.pingMs)} color="text-[var(--chart-1)]" />
        )}
        {status?.uptime != null && (
          <MetricPill icon={Clock}       value={formatUptime(status.uptime)}       color="text-success" />
        )}
        {status?.httpOk != null && (
          <MetricPill
            icon={Globe}
            value={status.httpOk ? "HTTP OK" : "HTTP Falha"}
            color={status.httpOk ? "text-success" : "text-destructive"}
          />
        )}
        {!status && (
          <span className="text-xs text-muted-foreground">Aguardando primeira coleta...</span>
        )}
      </div>

      {/* CPU / Memory bars */}
      {hasMetrics && (
        <div className="px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3 border-b">
          {status?.cpuLoad != null && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Cpu className="h-3 w-3 text-warning" />
                <span className="text-xs font-semibold text-muted-foreground">CPU</span>
              </div>
              <CpuBar value={status.cpuLoad} />
            </div>
          )}
          {status?.memoryUsed != null && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <MemoryStick className="h-3 w-3 text-chart-4" />
                <span className="text-xs font-semibold text-muted-foreground">Memória</span>
              </div>
              <CpuBar value={status.memoryUsed} />
            </div>
          )}
        </div>
      )}

      {/* Associated links */}
      {links.length > 0 && (
        <div>
          <button
            onClick={() => setLinksOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-muted-foreground" />
              Links de Internet
              <Badge variant="secondary" className="text-[10px]">{links.length}</Badge>
            </span>
            {linksOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {linksOpen && (
            <div className="overflow-x-auto border-t">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-5 py-2 font-medium text-muted-foreground">Link</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Interface</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">
                      <span className="flex items-center gap-1"><ArrowDownToLine className="h-3 w-3" />Download</span>
                    </th>
                    <th className="px-4 py-2 font-medium text-muted-foreground">
                      <span className="flex items-center gap-1"><ArrowUpFromLine className="h-3 w-3" />Upload</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {links.map(link => (
                    <tr key={link.id} className="hover:bg-muted/10">
                      <td className="px-5 py-2">
                        <p className="font-semibold">{link.name}</p>
                        {link.location && (
                          <p className="text-[10px] text-muted-foreground">{link.location}</p>
                        )}
                      </td>
                      <td className="px-4 py-2 font-mono text-muted-foreground">
                        {link.mikrotikInterface ?? "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center gap-1 font-semibold ${link.isOnline ? "text-success" : "text-destructive"}`}>
                          {link.isOnline ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <UtilBar bps={link.downloadBps} contractedBps={link.contractedDownloadBps} />
                      </td>
                      <td className="px-4 py-2">
                        <UtilBar bps={link.uploadBps} contractedBps={link.contractedUploadBps} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DHCP clients */}
      {device.routerosEnabled && (() => {
        const clients = status?.routerosData?.clients ?? null;
        return (
          <div className={links.length > 0 ? "border-t" : ""}>
            <button
              onClick={() => setClientsOpen(v => !v)}
              className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold hover:bg-muted/30 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Clientes DHCP
                {clients !== null && (
                  <Badge variant="secondary" className="text-[10px]">{clients.length}</Badge>
                )}
              </span>
              {clientsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {clientsOpen && (
              <div className="border-t">
                {clients === null ? (
                  <p className="px-5 py-3 text-xs text-muted-foreground">Aguardando primeira coleta...</p>
                ) : clients.length === 0 ? (
                  <p className="px-5 py-3 text-xs text-muted-foreground">Nenhum cliente DHCP ativo.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/40">
                        <tr>
                          <th className="text-left px-5 py-2 font-medium text-muted-foreground">Hostname</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">IP</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">MAC</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Servidor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {clients.map(client => (
                          <tr key={client.mac} className="hover:bg-muted/10">
                            <td className="px-5 py-2 font-semibold">
                              {client.hostname ?? <span className="text-muted-foreground italic">sem nome</span>}
                            </td>
                            <td className="px-4 py-2 font-mono text-muted-foreground">{client.ip || "—"}</td>
                            <td className="px-4 py-2 font-mono text-[10px] text-muted-foreground">{client.mac}</td>
                            <td className="px-4 py-2 text-muted-foreground">{client.server ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
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

export default function MikrotikPage() {
  const [devices,    setDevices]    = useState<MikrotikDevice[]>([]);
  const [links,      setLinks]      = useState<(AssociatedLink & { mikrotikDeviceId: string | null })[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  const load = useCallback(async () => {
    const [devRes, linkRes] = await Promise.all([
      fetch("/api/devices?type=MIKROTIK"),
      fetch("/api/links"),
    ]);
    if (devRes.ok)  setDevices(await devRes.json());
    if (linkRes.ok) setLinks(await linkRes.json());
    setLoading(false);
  }, []);

  async function handleCheckAll() {
    setIsChecking(true);
    await fetch("/api/devices/check?type=MIKROTIK", { method: "POST" }).catch(() => {});
    await load();
    setIsChecking(false);
  }

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  const online   = devices.filter(d => d.currentStatus?.isOnline).length;
  const offline  = devices.length - online;
  const withCpu  = devices.filter(d => d.currentStatus?.cpuLoad != null);
  const withMem  = devices.filter(d => d.currentStatus?.memoryUsed != null);
  const withPing = devices.filter(d => d.currentStatus?.pingMs != null);

  const avgCpu  = withCpu.length  ? withCpu.reduce((s, d)  => s + (d.currentStatus!.cpuLoad!),    0) / withCpu.length  : null;
  const avgMem  = withMem.length  ? withMem.reduce((s, d)  => s + (d.currentStatus!.memoryUsed!), 0) / withMem.length  : null;
  const avgPing = withPing.length ? withPing.reduce((s, d) => s + (d.currentStatus!.pingMs!),     0) / withPing.length : null;

  const sortedDevices = [...devices].sort((a, b) => {
    const aOn = a.currentStatus?.isOnline ?? false;
    const bOn = b.currentStatus?.isOnline ?? false;
    if (aOn !== bOn) return aOn ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  const linksForDevice = (deviceId: string) =>
    links.filter(l => l.mikrotikDeviceId === deviceId);

  return (
    <>
      <Topbar
        title="Painel Mikrotik"
        subtitle={loading ? "Carregando..." : `${devices.length} dispositivo${devices.length !== 1 ? "s" : ""} registrado${devices.length !== 1 ? "s" : ""}`}
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
            sub="dispositivos ativos"
            color={offline > 0 ? "text-warning" : "text-success"}
          />
          <KpiCard
            label="Ping médio"
            value={avgPing != null ? `${avgPing.toFixed(0)}ms` : "—"}
            sub="dispositivos com ping"
            color={avgPing == null ? undefined : avgPing < 50 ? "text-success" : avgPing < 150 ? "text-warning" : "text-destructive"}
          />
          <KpiCard
            label="CPU média"
            value={avgCpu != null ? `${avgCpu.toFixed(0)}%` : "—"}
            sub="via RouterOS API"
            color={avgCpu == null ? undefined : avgCpu > 70 ? "text-destructive" : avgCpu > 40 ? "text-warning" : "text-success"}
          />
          <KpiCard
            label="Mem média"
            value={avgMem != null ? `${avgMem.toFixed(0)}%` : "—"}
            sub="via RouterOS API"
            color={avgMem == null ? undefined : avgMem > 85 ? "text-destructive" : avgMem > 60 ? "text-warning" : "text-success"}
          />
        </div>

        {/* Device cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="rounded-xl border bg-card h-24 animate-pulse" />
            ))}
          </div>
        ) : devices.length === 0 ? (
          <div className="rounded-xl border bg-card px-6 py-12 text-center">
            <Router className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">Nenhum Mikrotik registrado</p>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione um dispositivo do tipo <strong>Mikrotik</strong> para visualizar o painel.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedDevices.map(d => (
              <DeviceCard
                key={d.id}
                device={d}
                links={linksForDevice(d.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
