"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DeviceDetailDrawer } from "@/components/device-detail-drawer";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { Topbar } from "@/components/topbar";
import { formatResponseTime, formatUptime, formatPercent } from "@/lib/format";
import type { Device, DeviceStatus, DeviceType } from "@prisma/client";

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
  const [loading, setLoading] = useState(true);
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

  async function load() {
    const res = await fetch("/api/devices");
    if (res.ok) setDevices(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

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

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
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
