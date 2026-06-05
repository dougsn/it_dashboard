"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DeviceDetailDrawer } from "@/components/device-detail-drawer";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PingSparkline } from "@/components/ping-sparkline";
import {
  Plus,
  Layers,
  Pencil,
  MapPin,
  Server,
  Router,
  HardDrive,
  Camera,
  Box,
  Wifi,
  WifiOff,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { formatResponseTime, formatUptime, formatPercent } from "@/lib/format";
import type { Device, DeviceStatus, DeviceType } from "@prisma/client";
import type { OverviewData } from "@/app/api/overview/route";

type DeviceWithStatus = Device & { currentStatus: DeviceStatus | null };

const TYPE_ICON: Record<DeviceType, React.ElementType> = {
  MIKROTIK: Router,
  DVR: HardDrive,
  CAMERA: Camera,
  OTHER: Box,
};

const TYPE_LABEL: Record<DeviceType, string> = {
  MIKROTIK: "Mikrotik",
  DVR: "DVR",
  CAMERA: "Câmera",
  OTHER: "Outro",
};

function pingColor(ms: number | null | undefined) {
  if (ms == null) return "text-muted-foreground";
  if (ms < 50) return "text-success";
  if (ms < 150) return "text-warning";
  return "text-destructive";
}

function pingDot(ms: number | null | undefined) {
  if (ms == null) return "bg-muted-foreground/30";
  if (ms < 50) return "bg-success";
  if (ms < 150) return "bg-warning";
  return "bg-destructive";
}

function MiniBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass}`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

// ─── Compact device card (card view) ─────────────────────────────────────────

const TYPE_ICON_BG: Record<DeviceType, string> = {
  MIKROTIK: "bg-primary/10 text-primary",
  DVR:      "bg-warning/10 text-warning",
  CAMERA:   "bg-destructive/10 text-destructive",
  OTHER:    "bg-muted text-muted-foreground",
};

function DeviceCard({
  device,
  sparkline,
  onClick,
}: {
  device: DeviceWithStatus;
  sparkline?: (number | null)[];
  onClick: () => void;
}) {
  const status = device.currentStatus;
  const isOnline = status?.isOnline ?? false;
  const ping = status?.pingMs;
  const isInstavel = isOnline && (ping ?? 0) > 150;
  const TypeIcon = TYPE_ICON[device.type];

  const borderColor = isInstavel
    ? "border-l-warning"
    : isOnline
    ? "border-l-success"
    : "border-l-destructive";

  const pingColor = isInstavel
    ? "text-warning"
    : isOnline
    ? "text-foreground"
    : "text-muted-foreground";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border bg-card border-l-4 ${borderColor} hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden`}
    >
      <div className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TYPE_ICON_BG[device.type]}`}>
              <TypeIcon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{device.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{device.ip}</p>
            </div>
          </div>
          {isInstavel ? (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 shrink-0">
              Instável
            </span>
          ) : (
            <span className={`text-[10px] font-semibold shrink-0 ${isOnline ? "text-success" : "text-destructive"}`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>

        {/* Ping + Sparkline */}
        <div className="flex items-end justify-between gap-1">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-xl font-extrabold leading-none tabular-nums ${pingColor}`}>
                {ping ?? "—"}
              </span>
              {ping != null && (
                <span className="text-[10px] text-muted-foreground font-medium">ms</span>
              )}
            </div>
            <p className="text-[7.5px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
              ping
            </p>
          </div>
          {sparkline && sparkline.length >= 3 ? (
            <PingSparkline data={sparkline} uid={device.id} width={90} height={32} />
          ) : (
            <svg width={90} height={32} aria-hidden="true">
              <line x1="3" y1="29" x2="87" y2="29" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          )}
        </div>

        {/* Location */}
        {device.location && (
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            {device.location}
          </p>
        )}
      </div>
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: "default" | "success" | "destructive";
}

type SortField = "name" | "ip" | "status" | "ping" | "location";
type SortDir = "asc" | "desc";

function SortableHeader({
  field,
  label,
  sortField,
  sortDir,
  onSort,
  className,
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (f: SortField) => void;
  className?: string;
}) {
  const active = sortField === field;
  return (
    <th className={className}>
      <button
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition-colors select-none ${
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        <span className="shrink-0">
          {active ? (
            sortDir === "asc" ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )
          ) : (
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
          )}
        </span>
      </button>
    </th>
  );
}

function FilterChip({ active, onClick, children, color = "default" }: FilterChipProps) {
  const activeClass =
    color === "success"
      ? "bg-success text-white border-success"
      : color === "destructive"
      ? "bg-destructive text-white border-destructive"
      : "bg-primary text-primary-foreground border-primary";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-medium border transition-all select-none whitespace-nowrap ${
        active
          ? activeClass
          : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceWithStatus[]>([]);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");
  const [typeFilter, setTypeFilter] = useState<DeviceType | "ALL">("ALL");
  const [drawerDeviceId, setDrawerDeviceId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const load = useCallback(async () => {
    const [devRes, ovRes] = await Promise.all([
      fetch("/api/devices"),
      fetch("/api/overview"),
    ]);
    if (devRes.ok) setDevices(await devRes.json());
    if (ovRes.ok) setOverviewData(await ovRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = devices
    .filter((d) => {
      const statusMatch =
        statusFilter === "ALL" ||
        (statusFilter === "ONLINE" && (d.currentStatus?.isOnline ?? false)) ||
        (statusFilter === "OFFLINE" && !(d.currentStatus?.isOnline ?? false));
      const typeMatch = typeFilter === "ALL" || d.type === typeFilter;
      return statusMatch && typeMatch;
    })
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name, "pt-BR");
          break;
        case "ip": {
          const toInt = (ip: string) =>
            ip.split(".").reduce((acc, oct) => (acc << 8) | parseInt(oct), 0) >>> 0;
          cmp = toInt(a.ip) - toInt(b.ip);
          break;
        }
        case "status": {
          const aOn = a.currentStatus?.isOnline ? 1 : 0;
          const bOn = b.currentStatus?.isOnline ? 1 : 0;
          cmp = bOn - aOn; // online primeiro quando asc
          break;
        }
        case "ping": {
          const ap = a.currentStatus?.pingMs ?? Infinity;
          const bp = b.currentStatus?.pingMs ?? Infinity;
          cmp = ap - bp;
          break;
        }
        case "location":
          cmp = (a.location ?? "").localeCompare(b.location ?? "", "pt-BR");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

  return (
    <>
      <Topbar title="Dispositivos" icon={Server} live={!loading}>
        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center justify-center h-8 w-8 transition-colors ${
              viewMode === "table"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title="Visualização em tabela"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`flex items-center justify-center h-8 w-8 transition-colors ${
              viewMode === "cards"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
            title="Visualização em cards"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>

        <Link
          href="/devices/new/bulk"
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          <Layers className="h-4 w-4 mr-1" />
          Em lote
        </Link>
        <Link href="/devices/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Link>
      </Topbar>

      <div className="p-7 space-y-4">
        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          <FilterChip active={statusFilter === "ALL"} onClick={() => setStatusFilter("ALL")}>
            Todos os status
          </FilterChip>
          <FilterChip
            active={statusFilter === "ONLINE"}
            onClick={() => setStatusFilter("ONLINE")}
            color="success"
          >
            <Wifi className="h-3 w-3" />
            Online
          </FilterChip>
          <FilterChip
            active={statusFilter === "OFFLINE"}
            onClick={() => setStatusFilter("OFFLINE")}
            color="destructive"
          >
            <WifiOff className="h-3 w-3" />
            Offline
          </FilterChip>

          <div className="w-px bg-border mx-0.5 self-stretch" />

          {(["ALL", "MIKROTIK", "DVR", "CAMERA", "OTHER"] as const).map((t) => (
            <FilterChip
              key={t}
              active={typeFilter === t}
              onClick={() => setTypeFilter(t)}
            >
              {t === "ALL" ? "Todos os tipos" : TYPE_LABEL[t]}
              {t !== "ALL" && (
                <span
                  className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold tabular-nums ${
                    typeFilter === t ? "bg-white/25" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {devices.filter((d) => d.type === t).length}
                </span>
              )}
            </FilterChip>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          viewMode === "cards" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          )
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {devices.length === 0 ? (
              <>
                <Server className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum dispositivo cadastrado.</p>
                <Link href="/devices/new" className={`mt-4 inline-flex ${buttonVariants({})}`}>
                  Cadastrar primeiro dispositivo
                </Link>
              </>
            ) : (
              <p>Nenhum dispositivo encontrado para os filtros selecionados.</p>
            )}
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                sparkline={overviewData?.sparklines[device.id]}
                onClick={() => setDrawerDeviceId(device.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <SortableHeader
                    field="name" label="Dispositivo"
                    sortField={sortField} sortDir={sortDir} onSort={handleSort}
                    className="text-left px-4 py-3"
                  />
                  <SortableHeader
                    field="ip" label="IP"
                    sortField={sortField} sortDir={sortDir} onSort={handleSort}
                    className="text-left px-4 py-3"
                  />
                  <SortableHeader
                    field="status" label="Status"
                    sortField={sortField} sortDir={sortDir} onSort={handleSort}
                    className="text-left px-4 py-3"
                  />
                  <SortableHeader
                    field="ping" label="Ping"
                    sortField={sortField} sortDir={sortDir} onSort={handleSort}
                    className="text-left px-4 py-3"
                  />
                  <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    CPU
                  </th>
                  <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Uptime
                  </th>
                  <SortableHeader
                    field="location" label="Local"
                    sortField={sortField} sortDir={sortDir} onSort={handleSort}
                    className="hidden sm:table-cell text-left px-4 py-3"
                  />
                  <th className="text-right px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((device) => {
                  const TypeIcon = TYPE_ICON[device.type];
                  const status = device.currentStatus;

                  return (
                    <tr
                      key={device.id}
                      onClick={() => setDrawerDeviceId(device.id)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      {/* Dispositivo */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
                            <TypeIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate group-hover:text-primary transition-colors">
                              {device.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {TYPE_LABEL[device.type]}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {device.ip}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge isOnline={status?.isOnline ?? false} />
                      </td>

                      {/* Ping */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${pingDot(status?.pingMs)}`}
                          />
                          <span className={`font-mono text-xs font-medium ${pingColor(status?.pingMs)}`}>
                            {formatResponseTime(status?.pingMs)}
                          </span>
                        </div>
                      </td>

                      {/* CPU */}
                      <td className="hidden md:table-cell px-4 py-3">
                        {status?.cpuLoad != null ? (
                          <div className="flex items-center gap-2">
                            <MiniBar
                              value={status.cpuLoad}
                              colorClass={
                                status.cpuLoad < 60
                                  ? "bg-success"
                                  : status.cpuLoad < 85
                                  ? "bg-warning"
                                  : "bg-destructive"
                              }
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              {formatPercent(status.cpuLoad)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </td>

                      {/* Uptime */}
                      <td className="hidden lg:table-cell px-4 py-3 text-xs font-mono text-muted-foreground">
                        {status?.uptime != null ? formatUptime(status.uptime) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>

                      {/* Local */}
                      <td className="hidden sm:table-cell px-4 py-3">
                        {device.location ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {device.location}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/devices/${device.id}/edit`}
                          className={buttonVariants({ variant: "ghost", size: "icon" })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeviceDetailDrawer
        deviceId={drawerDeviceId}
        onClose={() => setDrawerDeviceId(null)}
      />
    </>
  );
}
