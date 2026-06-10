"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUptime } from "@/lib/format";
import { DEVICE_TYPE_ICON, DEVICE_TYPE_ICON_BG, DEVICE_TYPE_LABEL } from "@/lib/device-constants";
import { MapPin, History, Zap, X } from "lucide-react";
import { PingSparkline } from "@/components/ping-sparkline";
import type { Device, DeviceStatus, StatusHistory } from "@prisma/client";

type DeviceWithStatus = Device & { currentStatus: DeviceStatus | null };

// ─── Uptime segments ─────────────────────────────────────────────────────────

type Seg = "online" | "offline" | "degraded" | "empty";

const SEG_COLOR: Record<Seg, string> = {
  online: "bg-success", offline: "bg-destructive", degraded: "bg-warning", empty: "bg-muted/60",
};

function buildSegments(history: StatusHistory[]): Seg[] {
  const now = Date.now();
  return Array.from({ length: 48 }, (_, i) => {
    const segEnd = now - i * 1_800_000;          // 30-min slots
    const segStart = segEnd - 1_800_000;
    const checks = history.filter((h) => {
      const t = new Date(h.timestamp).getTime();
      return t >= segStart && t < segEnd;
    });
    if (checks.length === 0) return "empty";
    const pct = checks.filter((h) => h.isOnline).length / checks.length;
    if (pct > 0.8) return "online";
    if (pct > 0.2) return "degraded";
    return "offline";
  }).reverse();
}

// ─── Metric tile ─────────────────────────────────────────────────────────────

function MetricTile({ label, value, unit, loading }: {
  label: string; value: string | number | null; unit?: string; loading?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3.5">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      {loading ? <Skeleton className="h-7 w-16" /> : (
        <div className="flex items-baseline gap-1">
          <span className="text-[1.6rem] font-extrabold leading-none tabular-nums text-foreground">
            {value ?? "—"}
          </span>
          {unit && value != null && (
            <span className="text-sm font-semibold text-muted-foreground">{unit}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Info row ────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface Props {
  deviceId: string | null;
  onClose: () => void;
}

const HOUR_OPTIONS = [
  { label: "1h",  value: 1   },
  { label: "6h",  value: 6   },
  { label: "24h", value: 24  },
  { label: "7d",  value: 168 },
] as const;
type HourOption = typeof HOUR_OPTIONS[number]["value"];

export function DeviceDetailDrawer({ deviceId, onClose }: Props) {
  const [device, setDevice] = useState<DeviceWithStatus | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [hours, setHours] = useState<HourOption>(24);

  const fetchData = useCallback(async (id: string, h: number) => {
    setLoading(true);
    const [dev, hist] = await Promise.all([
      fetch(`/api/devices/${id}`).then((r) => r.json()),
      fetch(`/api/status/${id}?hours=${h}`).then((r) => r.json()),
    ]);
    setDevice(dev);
    setHistory(Array.isArray(hist) ? hist : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!deviceId) { setDevice(null); setHistory([]); return; }
    fetchData(deviceId, hours);
  }, [deviceId, hours, fetchData]);

  async function handleTest() {
    if (!deviceId) return;
    setTesting(true);
    await fetchData(deviceId, hours);
    setTesting(false);
  }

  // ── Computed metrics ────────────────────────────────────────────────────────
  const pings = history.map((h) => h.pingMs).filter((v): v is number => v != null);
  const pingAvg = pings.length > 0 ? Math.round(pings.reduce((s, v) => s + v, 0) / pings.length) : null;
  const pingPeak = pings.length > 0 ? Math.max(...pings) : null;
  const packetLoss = history.length > 0
    ? Math.round((history.filter((h) => !h.isOnline).length / history.length) * 100)
    : 0;
  const onlineChecks = history.filter((h) => h.isOnline).length;
  const uptime24h = history.length > 0
    ? ((onlineChecks / history.length) * 100).toFixed(1)
    : null;

  const status = device?.currentStatus;
  const TypeIcon = device ? DEVICE_TYPE_ICON[device.type] : DEVICE_TYPE_ICON.OTHER;

  const timeLabels = history.map((h) =>
    new Date(h.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );

  const sparklineData   = history.map((h) => (h.isOnline ? (h.pingMs ?? null) : null));
  const cpuSparkline    = history.map((h) => h.cpuLoad ?? null);
  const memorySparkline = history.map((h) => h.memoryUsed ?? null);

  const segments = buildSegments(history);

  return (
    <Sheet open={deviceId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="sm:max-w-[420px] w-full p-0 flex flex-col gap-0 overflow-y-auto"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          {loading || !device ? (
            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-5 w-14" />
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${DEVICE_TYPE_ICON_BG[device.type]}`}>
                  <TypeIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[15px] leading-tight truncate">{device.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <span className="font-mono">{device.ip}</span>
                    {device.location && (
                      <>
                        <span className="opacity-40">·</span>
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{device.location}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      status?.isOnline
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {status?.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 px-5 py-5 space-y-5">

          {/* Metrics 2×2 */}
          <div className="grid grid-cols-2 gap-2.5">
            <MetricTile label="Ping atual"       value={status?.pingMs ?? null} unit="ms" loading={loading} />
            <MetricTile label="Ping médio"        value={pingAvg}               unit="ms" loading={loading} />
            <MetricTile label="Pico"              value={pingPeak}              unit="ms" loading={loading} />
            <MetricTile label="Perda de pacote"   value={`${packetLoss}%`}      loading={loading} />
          </div>

          {/* Latency chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">
                Latência
              </p>
              <div className="flex items-center gap-0.5">
                {HOUR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setHours(opt.value)}
                    className={`px-2 h-5 rounded text-[10px] font-semibold transition-colors ${
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
            {loading ? (
              <Skeleton className="h-24 w-full rounded-xl" />
            ) : sparklineData.length >= 3 ? (
              <div className="w-full rounded-xl overflow-hidden border border-border bg-muted/20 px-2 pt-2 pb-1">
                <PingSparkline
                  data={sparklineData}
                  labels={timeLabels}
                  uid={`drawer-${deviceId}`}
                  responsive
                  width={380}
                  height={88}
                  showTooltip
                />
              </div>
            ) : (
              <div className="h-24 rounded-xl border border-border bg-muted/20 flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Sem dados para o período</p>
              </div>
            )}
          </div>

          {/* CPU + Memory charts — Mikrotik/SNMP/RouterOS only */}
          {device && (device.snmpEnabled || device.routerosEnabled) && (
            <>
              <div className="space-y-2">
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">
                  CPU (%)
                </p>
                {loading ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : cpuSparkline.some((v) => v !== null) && cpuSparkline.length >= 3 ? (
                  <div className="w-full rounded-xl overflow-hidden border border-border bg-muted/20 px-2 pt-2 pb-1">
                    <PingSparkline
                      data={cpuSparkline}
                      labels={timeLabels}
                      uid={`drawer-cpu-${deviceId}`}
                      threshold={80}
                      responsive
                      width={380}
                      height={88}
                      showTooltip
                      unit="%"
                      decimals={2}
                    />
                  </div>
                ) : (
                  <div className="h-24 rounded-xl border border-border bg-muted/20 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Sem dados para o período</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">
                  Memória (%)
                </p>
                {loading ? (
                  <Skeleton className="h-24 w-full rounded-xl" />
                ) : memorySparkline.some((v) => v !== null) && memorySparkline.length >= 3 ? (
                  <div className="w-full rounded-xl overflow-hidden border border-border bg-muted/20 px-2 pt-2 pb-1">
                    <PingSparkline
                      data={memorySparkline}
                      labels={timeLabels}
                      uid={`drawer-mem-${deviceId}`}
                      threshold={80}
                      responsive
                      width={380}
                      height={88}
                      showTooltip
                      unit="%"
                      decimals={2}
                    />
                  </div>
                ) : (
                  <div className="h-24 rounded-xl border border-border bg-muted/20 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Sem dados para o período</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Availability bar */}
          <div className="space-y-2">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">
              Disponibilidade (24h)
            </p>
            {loading ? (
              <Skeleton className="h-5 w-full rounded" />
            ) : (
              <div className="flex gap-0.5">
                {segments.map((s, i) => (
                  <div key={i} className={`flex-1 h-5 rounded-[3px] ${SEG_COLOR[s]}`} />
                ))}
              </div>
            )}
          </div>

          {/* Device info table */}
          <div className="space-y-0.5">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Informações do dispositivo
            </p>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between py-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            ) : device ? (
              <div>
                <InfoRow label="Tipo"              value={DEVICE_TYPE_LABEL[device.type]} />
                <InfoRow label="Endereço IP"       value={device.ip} />
                {status?.uptime != null && (
                  <InfoRow label="Uptime"          value={formatUptime(status.uptime)} />
                )}
                {uptime24h && (
                  <InfoRow label="Disponibilidade 24h" value={`${uptime24h}%`} />
                )}
                {status?.checkedAt && (
                  <InfoRow
                    label="Última verificação"
                    value={new Date(status.checkedAt).toLocaleTimeString("pt-BR")}
                  />
                )}
              </div>
            ) : null}
          </div>

        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        {device && (
          <div className="px-5 py-4 border-t border-border flex gap-2.5 shrink-0">
            <button
              onClick={handleTest}
              disabled={testing || loading}
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Zap className="h-4 w-4" />
              {testing ? "Testando..." : "Testar agora"}
            </button>
            <Link
              href={`/devices/${device.id}`}
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors"
            >
              <History className="h-4 w-4" />
              Histórico
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
