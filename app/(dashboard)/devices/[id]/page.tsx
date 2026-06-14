"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { MetricsChart } from "@/components/metrics-chart";
import { PingChart } from "@/components/ping-chart";
import { formatUptime, formatResponseTime, formatPercent, fmtDateTime, formatBps, formatBytes } from "@/lib/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Topbar } from "@/components/topbar";
import {
  Pencil, Trash2, Cpu, MemoryStick, Clock, Wifi, Globe, Activity,
  Users, Radio, AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  ChevronDown, ChevronUp, ArrowUpDown, FileText, RefreshCw,
} from "lucide-react";

import { toast } from "sonner";
import type { Device, DeviceStatus, StatusHistory } from "@prisma/client";

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

interface OmadaSSID {
  ssid: string;
  band: string;
  channel: string | null;
  clients: number;
}

interface OmadaClient {
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
}

interface RouterOSClient {
  mac: string;
  ip: string;
  hostname: string | null;
  server: string | null;
}

interface RouterOSData {
  clients: RouterOSClient[];
}

interface OmadaData {
  model: string | null;
  firmware: string | null;
  uptime: number | null;
  cpuLoad: number | null;
  memoryUsed: number | null;
  uplinkTxBps: number | null;
  uplinkRxBps: number | null;
  totalClients: number;
  ssids: OmadaSSID[];
  clients: OmadaClient[];
}

type DeviceWithStatus = Device & { currentStatus: DeviceStatus | null };

const HOUR_OPTIONS = [
  { label: "1h",  value: 1   },
  { label: "6h",  value: 6   },
  { label: "24h", value: 24  },
  { label: "7d",  value: 168 },
] as const;
type HourOption = typeof HOUR_OPTIONS[number]["value"];

type ClientSortKey = "name" | "ip" | "connectedAt" | "signal" | "band" | "uptime";

export default function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [device, setDevice] = useState<DeviceWithStatus | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState<HourOption>(24);
  const [isChecking, setIsChecking] = useState(false);
  const [clientsExpanded, setClientsExpanded] = useState(false);
  const [dhcpExpanded, setDhcpExpanded] = useState(false);
  const [clientSort, setClientSort] = useState<ClientSortKey>("signal");
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const load = useCallback(async (h: number, signal?: AbortSignal) => {
    try {
      const [devRes, histRes] = await Promise.all([
        fetch(`/api/devices/${id}`, { cache: "no-store", signal }),
        fetch(`/api/status/${id}?hours=${h}`, { cache: "no-store", signal }),
      ]);
      if (devRes.ok) setDevice(await devRes.json());
      if (histRes.ok) setHistory(await histRes.json());
    } catch (err) {
      if (signal?.aborted || (err instanceof DOMException && err.name === "AbortError")) return;
      console.error("[device-detail] falha ao carregar dados:", err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    load(hours, controller.signal);
    return () => controller.abort();
  }, [hours, load]);

  useEffect(() => {
    const interval = setInterval(() => load(hours), 30_000);
    return () => clearInterval(interval);
  }, [id, hours, load]);

  async function handleCheck() {
    setIsChecking(true);
    await fetch(`/api/devices/${id}/check`, { method: "POST" }).catch(() => {});
    await load(hours);
    setIsChecking(false);
  }

  async function handleDelete() {
    const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Dispositivo removido");
      router.push("/devices");
    } else {
      toast.error("Erro ao remover dispositivo");
    }
  }

  if (loading && !device) {
    return (
      <>
        <Topbar title="Carregando..." back="/devices" backLabel="Dispositivos" />
        <div className="p-7 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </>
    );
  }

  if (!device) return <div className="p-7"><p className="text-muted-foreground">Dispositivo não encontrado.</p></div>;

  const status = device.currentStatus;
  const hasSystemMetrics = device.snmpEnabled || device.routerosEnabled || device.unifiEnabled || (device as Device & { omadaEnabled?: boolean }).omadaEnabled;
  const unifiData = (status?.unifiData ?? null) as UnifiData | null;
  const unifiError = device.unifiEnabled ? (status?.unifiError ?? null) : null;
  const isInformApi = (device as Device & { unifiAuthMethod?: string }).unifiAuthMethod === "userpass";
  const omadaData = ((status as (typeof status & { omadaData?: unknown }))?.omadaData ?? null) as OmadaData | null;
  const omadaError = (device as Device & { omadaEnabled?: boolean }).omadaEnabled ? ((status as (typeof status & { omadaError?: string }))?.omadaError ?? null) : null;
  const routerosData = device.routerosEnabled
    ? (((status as (typeof status & { routerosData?: unknown }))?.routerosData ?? null) as RouterOSData | null)
    : null;

  // Build sorted client list (UniFi or Omada)
  const activeClients = unifiData?.clients ?? omadaData?.clients ?? [];
  const sortedClients = [...activeClients].sort((a, b) => {
    if (clientSort === "name") return a.name.localeCompare(b.name);
    if (clientSort === "ip") return (a.ip ?? "").localeCompare(b.ip ?? "");
    if (clientSort === "band") return ((a as OmadaClient).band ?? "").localeCompare((b as OmadaClient).band ?? "");
    if (clientSort === "uptime") return ((b as OmadaClient).uptime ?? 0) - ((a as OmadaClient).uptime ?? 0);
    if (clientSort === "connectedAt") return new Date((b as UnifiClient).connectedAt ?? 0).getTime() - new Date((a as UnifiClient).connectedAt ?? 0).getTime();
    return (b.signal ?? -200) - (a.signal ?? -200); // strongest first (default)
  });

  const reversedHistory = [...history].reverse();
  const historyVisible = historyExpanded ? reversedHistory : reversedHistory.slice(0, 20);

  function SortButton({ col, label }: { col: ClientSortKey; label: string }) {
    return (
      <button
        onClick={() => setClientSort(col)}
        className={`flex items-center gap-1 hover:text-foreground transition-colors ${
          clientSort === col ? "text-foreground font-semibold" : "text-muted-foreground"
        }`}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
      </button>
    );
  }

  return (
    <>
      <Topbar
        title={device.name}
        badge={<StatusBadge isOnline={status?.isOnline ?? false} />}
        subtitle={`${device.ip}${device.location ? ` · ${device.location}` : ''}`}
        back="/devices"
        backLabel="Dispositivos"
      >
        <Link href={`/reports?device=${id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <FileText className="h-4 w-4 mr-1" />
          Relatório
        </Link>
        <Button variant="outline" size="sm" onClick={handleCheck} disabled={isChecking}>
          <RefreshCw className={`h-4 w-4 mr-1 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Verificando..." : "Verificar agora"}
        </Button>
        <Link href={`/devices/${id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Link>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Remover
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover dispositivo?</AlertDialogTitle>
              <AlertDialogDescription>
                Todo o histórico de monitoramento será apagado. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Topbar>

      <div className="p-7 space-y-6">
        {/* Row 1: 4 metric cards always on same line */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            icon={Wifi}
            label="Ping"
            value={formatResponseTime(status?.pingMs)}
            color="text-[var(--chart-1)]"
          />
          <MetricCard
            icon={Clock}
            label="Uptime"
            value={status?.uptime != null ? formatUptime(status.uptime) : unifiData?.uptime != null ? formatUptime(unifiData.uptime) : "—"}
            color="text-success"
          />
          <MetricCard
            icon={Cpu}
            label="CPU"
            value={
              status?.cpuLoad != null ? `${status.cpuLoad.toFixed(1)}%`
              : unifiData?.cpuLoad != null ? `${unifiData.cpuLoad.toFixed(1)}%`
              : "—"
            }
            color="text-warning"
          />
          <MetricCard
            icon={MemoryStick}
            label="Memória"
            value={
              status?.memoryUsed != null ? `${status.memoryUsed.toFixed(1)}%`
              : unifiData?.memoryUsed != null ? `${unifiData.memoryUsed.toFixed(1)}%`
              : "—"
            }
            color="text-[var(--chart-4)]"
          />
        </div>

        {/* Row 2 (UniFi/Omada): bandwidth + clients + http */}
        {(unifiData != null || omadaData != null || status?.httpOk != null) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(unifiData ?? omadaData) != null && (() => {
              const apData = unifiData ?? omadaData!;
              return (
                <>
                  <MetricCard
                    icon={ArrowDownToLine}
                    label="Downlink"
                    value={formatBps(apData.uplinkRxBps)}
                    color="text-[var(--chart-2)]"
                  />
                  <MetricCard
                    icon={ArrowUpFromLine}
                    label="Uplink"
                    value={formatBps(apData.uplinkTxBps)}
                    color="text-[var(--chart-3)]"
                  />
                  <MetricCard
                    icon={Users}
                    label="Clientes"
                    value={String(apData.totalClients)}
                    color="text-[var(--chart-5)]"
                  />
                </>
              );
            })()}
            {status?.httpOk != null && (
              <MetricCard
                icon={Globe}
                label="HTTP"
                value={status.httpOk ? "OK" : "Falha"}
                color={status.httpOk ? "text-success" : "text-destructive"}
              />
            )}
          </div>
        )}

        {/* AP hardware badges (UniFi or Omada) */}
        {(unifiData ?? omadaData) && (() => {
          const apData = unifiData ?? omadaData!;
          return (apData.model || apData.firmware) ? (
            <div className="flex flex-wrap gap-2">
              {apData.model && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Radio className="h-3 w-3" />
                  {apData.model}
                </Badge>
              )}
              {apData.firmware && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  fw {apData.firmware}
                </Badge>
              )}
            </div>
          ) : null;
        })()}

        {/* Protocol badges */}
        <div className="flex flex-wrap gap-2">
          {device.pingEnabled && <Badge variant="outline">Ping</Badge>}
          {device.httpEnabled && <Badge variant="outline">HTTP :{device.httpPort ?? 80}</Badge>}
          {device.snmpEnabled && <Badge variant="outline">SNMP</Badge>}
          {device.routerosEnabled && <Badge variant="outline">RouterOS API</Badge>}
          {device.unifiEnabled && (
            <Badge variant="outline" className={unifiError ? "border-destructive text-destructive" : ""}>
              UniFi API
            </Badge>
          )}
          {(device as Device & { omadaEnabled?: boolean }).omadaEnabled && (
            <Badge variant="outline" className={omadaError ? "border-destructive text-destructive" : ""}>
              Omada API
            </Badge>
          )}
        </div>

        {/* UniFi connection error alert */}
        {unifiError && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-destructive">Falha na conexão com o controlador UniFi</p>
              <p className="text-xs text-muted-foreground mt-0.5 wrap-break-word">{unifiError}</p>
            </div>
          </div>
        )}

        {/* Omada connection error alert */}
        {omadaError && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-destructive">Falha na conexão com o controlador Omada</p>
              <p className="text-xs text-muted-foreground mt-0.5 wrap-break-word">{omadaError}</p>
            </div>
          </div>
        )}

        {/* Weak signal alert */}
        {(() => {
          const weakClients = [...(unifiData?.clients ?? []), ...(omadaData?.clients ?? [])].filter((c) => c.signal != null && c.signal < -80);
          if (weakClients.length === 0) return null;
          return (
            <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/5 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-warning">
                  {weakClients.length} cliente{weakClients.length !== 1 ? "s" : ""} com sinal fraco
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {weakClients.map((c) => `${c.name} (${c.signal} dBm)`).join(", ")}
                </p>
              </div>
            </div>
          );
        })()}

        <Separator />

        {/* Charts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Métricas
            </h2>
            <div className="flex items-center gap-0.5">
              {HOUR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setHours(opt.value)}
                  className={`px-2.5 h-6 rounded text-[11px] font-semibold transition-colors ${
                    hours === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="pt-4">
              {loading ? (
                <Skeleton className="h-44 w-full" />
              ) : history.length >= 2 ? (
                <PingChart history={history} />
              ) : (
                <div className="h-44 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground">Sem dados para o período</p>
                </div>
              )}
            </CardContent>
          </Card>

          {hasSystemMetrics && history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  {loading ? <Skeleton className="h-44 w-full" /> : (
                    <MetricsChart history={history} metric="cpuLoad" label="CPU (%)" color="var(--warning)" unit="%" />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  {loading ? <Skeleton className="h-44 w-full" /> : (
                    <MetricsChart history={history} metric="memoryUsed" label="Memória (%)" color="var(--chart-4)" unit="%" />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* SSIDs (UniFi or Omada) */}
        {(unifiData ?? omadaData) && (() => {
          const apData = unifiData ?? omadaData!;
          const ssids = apData.ssids;
          if (ssids.length === 0) return null;
          const showExtended = isInformApi && unifiData != null;
          return (
            <div className="space-y-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Redes Wi-Fi
              </h2>
              <div className="rounded-lg border bg-card overflow-x-auto">
                <table className="w-full text-xs" aria-label="Redes Wi-Fi">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-medium">SSID</th>
                      <th className="text-left px-4 py-2.5 font-medium">Banda</th>
                      <th className="text-left px-4 py-2.5 font-medium">Canal</th>
                      <th className="text-right px-4 py-2.5 font-medium">Clientes</th>
                      {showExtended && <th className="text-right px-4 py-2.5 font-medium">RX Total</th>}
                      {showExtended && <th className="text-right px-4 py-2.5 font-medium">TX Total</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ssids.map((s, i) => (
                      <tr key={i} className="hover:bg-muted/10">
                        <td className="px-4 py-2 font-medium">{s.ssid}</td>
                        <td className="px-4 py-2">
                          <Badge variant="secondary" className="text-[10px] font-mono">{s.band}</Badge>
                        </td>
                        <td className="px-4 py-2 font-mono text-muted-foreground">
                          {omadaData
                            ? ((s as OmadaSSID).channel ?? "—")
                            : ((s as UnifiSSID).channel > 0 ? `ch ${(s as UnifiSSID).channel}` : "—")}
                        </td>
                        <td className="px-4 py-2 text-right font-mono">{s.clients}</td>
                        {showExtended && <td className="px-4 py-2 text-right font-mono text-muted-foreground">{formatBytes((s as UnifiSSID).rxBytes)}</td>}
                        {showExtended && <td className="px-4 py-2 text-right font-mono text-muted-foreground">{formatBytes((s as UnifiSSID).txBytes)}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Collapsible client table (UniFi or Omada) */}
        {activeClients.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setClientsExpanded((v) => !v)}
              aria-expanded={clientsExpanded}
              className="w-full flex items-center justify-between font-semibold hover:text-foreground/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                Clientes conectados
                <Badge variant="secondary" className="text-xs">{activeClients.length}</Badge>
              </span>
              {clientsExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
            </button>
            {clientsExpanded && (
              <div className="rounded-lg border bg-card overflow-x-auto">
                <table className="w-full text-xs" aria-label="Clientes Wi-Fi conectados">
                  <thead className="bg-muted/40 border-b">
                    <tr>
                      <th className="px-4 py-2.5 text-left">
                        <SortButton col="name" label="Nome / MAC" />
                      </th>
                      <th className="px-4 py-2.5 text-left">
                        <SortButton col="ip" label="IP" />
                      </th>
                      {(isInformApi || omadaData) && (
                        <th className="px-4 py-2.5 text-left">
                          <SortButton col="signal" label="Sinal" />
                        </th>
                      )}
                      {(isInformApi || omadaData) && (
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">SSID</th>
                      )}
                      {omadaData && (
                        <th className="px-4 py-2.5 text-left">
                          <SortButton col="band" label="Banda" />
                        </th>
                      )}
                      {omadaData && (
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Wi-Fi</th>
                      )}
                      {omadaData && (
                        <th className="px-4 py-2.5 text-left">
                          <SortButton col="uptime" label="Conectado há" />
                        </th>
                      )}
                      {isInformApi && (
                        <th className="px-4 py-2.5 text-left">
                          <SortButton col="connectedAt" label="Conectado em" />
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedClients.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/10">
                        <td className="px-4 py-2 font-medium max-w-50 truncate" title={c.name}>{c.name}</td>
                        <td className="px-4 py-2 font-mono text-muted-foreground">{c.ip ?? "—"}</td>
                        {(isInformApi || omadaData) && (
                          <td className="px-4 py-2">
                            {c.signal != null
                              ? <SignalBadge dbm={c.signal} snr={omadaData ? (c as OmadaClient).snr : null} />
                              : "—"}
                          </td>
                        )}
                        {(isInformApi || omadaData) && (
                          <td className="px-4 py-2 text-muted-foreground">{c.ssid ?? "—"}</td>
                        )}
                        {omadaData && (
                          <td className="px-4 py-2 text-muted-foreground">{(c as OmadaClient).band ?? "—"}</td>
                        )}
                        {omadaData && (
                          <td className="px-4 py-2 text-muted-foreground font-mono">
                            {wifiGenLabel((c as OmadaClient).wifiMode)}
                          </td>
                        )}
                        {omadaData && (
                          <td className="px-4 py-2 font-mono text-muted-foreground">
                            {formatUptime((c as OmadaClient).uptime)}
                          </td>
                        )}
                        {isInformApi && (
                          <td className="px-4 py-2 font-mono text-muted-foreground">
                            {(c as UnifiClient).connectedAt ? fmtDateTime((c as UnifiClient).connectedAt!) : "—"}
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

        {/* DHCP clients (RouterOS) */}
        {device.routerosEnabled && (
          <div className="space-y-3">
            <button
              onClick={() => setDhcpExpanded((v) => !v)}
              aria-expanded={dhcpExpanded}
              className="w-full flex items-center justify-between font-semibold hover:text-foreground/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" aria-hidden="true" />
                Clientes DHCP
                {routerosData !== null && (
                  <Badge variant="secondary" className="text-xs">{routerosData.clients.length}</Badge>
                )}
              </span>
              {dhcpExpanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
            </button>
            {dhcpExpanded && (
              <div className="rounded-lg border bg-card overflow-x-auto">
                {routerosData === null ? (
                  <p className="px-4 py-3 text-xs text-muted-foreground">Aguardando primeira coleta...</p>
                ) : routerosData.clients.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-muted-foreground">Nenhum cliente DHCP ativo.</p>
                ) : (
                  <table className="w-full text-xs" aria-label="Clientes DHCP ativos">
                    <thead className="bg-muted/40 border-b">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium">Hostname</th>
                        <th className="text-left px-4 py-2.5 font-medium">IP</th>
                        <th className="text-left px-4 py-2.5 font-medium">MAC</th>
                        <th className="text-left px-4 py-2.5 font-medium">Servidor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {routerosData.clients.map((c) => (
                        <tr key={c.mac} className="hover:bg-muted/10">
                          <td className="px-4 py-2 font-medium">
                            {c.hostname ?? <span className="text-muted-foreground italic">sem nome</span>}
                          </td>
                          <td className="px-4 py-2 font-mono text-muted-foreground">{c.ip || "—"}</td>
                          <td className="px-4 py-2 font-mono text-[10px] text-muted-foreground">{c.mac}</td>
                          <td className="px-4 py-2 text-muted-foreground">{c.server ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* History table — 20 items default, collapsible */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Histórico recente</h2>
            <div className="rounded-lg border bg-card overflow-x-auto">
              <table className="w-full text-xs" aria-label="Histórico de status do dispositivo">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Data/Hora</th>
                    <th className="text-left px-4 py-2.5 font-medium">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium">Ping</th>
                    {hasSystemMetrics && (
                      <>
                        <th className="text-left px-4 py-2.5 font-medium">CPU</th>
                        <th className="text-left px-4 py-2.5 font-medium">Memória</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {historyVisible.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/10">
                      <td className="px-4 py-2 font-mono text-muted-foreground">
                        {fmtDateTime(h.timestamp)}
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge isOnline={h.isOnline} />
                      </td>
                      <td className="px-4 py-2 font-mono">{formatResponseTime(h.pingMs)}</td>
                      {hasSystemMetrics && (
                        <>
                          <td className="px-4 py-2 font-mono">{formatPercent(h.cpuLoad)}</td>
                          <td className="px-4 py-2 font-mono">{formatPercent(h.memoryUsed)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reversedHistory.length > 20 && (
              <button
                onClick={() => setHistoryExpanded((v) => !v)}
                aria-expanded={historyExpanded}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                {historyExpanded ? (
                  <><ChevronUp className="h-3.5 w-3.5" /> Mostrar menos</>
                ) : (
                  <><ChevronDown className="h-3.5 w-3.5" /> Ver todos os {reversedHistory.length} registros</>
                )}
              </button>
            )}
          </div>
        )}

        {device.notes && (
          <>
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Observações</p>
              <p className="text-sm whitespace-pre-wrap">{device.notes}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function SignalBadge({ dbm, snr }: { dbm: number; snr?: number | null }) {
  const color =
    dbm >= -60 ? "text-success" :
    dbm >= -75 ? "text-warning" :
    "text-destructive";
  return (
    <span className="flex flex-col leading-tight">
      <span className={`font-mono font-semibold ${color}`}>{dbm} dBm</span>
      {snr != null && <span className="font-mono text-[10px] text-muted-foreground">SNR {snr} dB</span>}
    </span>
  );
}

function wifiGenLabel(mode: number | null): string {
  if (mode == null) return "—";
  if (mode >= 4 && mode <= 7) return `Wi-Fi ${mode}`;
  return "—";
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-3 pb-3 px-4">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
          <Icon className={`h-3 w-3 ${color}`} />
          {label}
        </p>
        <p className="text-xl font-bold font-mono leading-tight truncate">{value}</p>
      </CardContent>
    </Card>
  );
}
