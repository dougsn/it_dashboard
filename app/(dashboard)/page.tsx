"use client";

import { useState, useEffect, useRef } from "react";
import { DeviceCard } from "@/components/device-card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Topbar } from "@/components/topbar";
import {
  RefreshCw,
  Plus,
  Wifi,
  WifiOff,
  Server,
  Network,
  LayoutDashboard,
  Activity,
} from "lucide-react";
import Link from "next/link";
import type { Device, DeviceStatus, DeviceType } from "@prisma/client";

type DeviceWithStatus = Device & { currentStatus: DeviceStatus | null };

interface LinkItem {
  id: string;
  name: string;
  description: string | null;
  isOnline: boolean;
  lastEventAt: string | null;
}

const TYPE_LABELS: Record<DeviceType | "ALL", string> = {
  ALL: "Todos",
  MIKROTIK: "Mikrotik",
  DVR: "DVR",
  CAMERA: "Câmera",
  OTHER: "Outro",
};

function useCountUp(target: number, duration = 500) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const from = fromRef.current;
    startRef.current = null;

    if (from === target) return;

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (target - from) * eased);
      setValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

interface KpiCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ElementType;
  color: "success" | "destructive" | "primary" | "muted";
  loading?: boolean;
}

function KpiCard({ label, value, suffix, icon: Icon, color, loading }: KpiCardProps) {
  const animated = useCountUp(value);

  const colorMap = {
    success: {
      bg: "bg-success/10",
      border: "border-success/20",
      icon: "text-success bg-success/10",
      value: "text-success",
    },
    destructive: {
      bg: "bg-destructive/10",
      border: "border-destructive/20",
      icon: "text-destructive bg-destructive/10",
      value: "text-destructive",
    },
    primary: {
      bg: "bg-accent",
      border: "border-primary/20",
      icon: "text-primary bg-accent",
      value: "text-primary",
    },
    muted: {
      bg: "bg-muted/60",
      border: "border-border",
      icon: "text-muted-foreground bg-muted",
      value: "text-foreground",
    },
  };

  const c = colorMap[color];

  return (
    <Card className={`border ${c.border} ${c.bg} shadow-none`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          {loading ? (
            <>
              <Skeleton className="h-6 w-10 mb-1" />
              <Skeleton className="h-3 w-16" />
            </>
          ) : (
            <>
              <p className={`text-2xl font-bold leading-none tabular-nums ${c.value}`}>
                {animated}
                {suffix && <span className="text-sm font-medium ml-0.5">{suffix}</span>}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: "default" | "success" | "destructive";
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

export default function OverviewPage() {
  const [devices, setDevices] = useState<DeviceWithStatus[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DeviceType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    const [devRes, linkRes] = await Promise.all([
      fetch("/api/devices"),
      fetch("/api/links"),
    ]);
    if (devRes.ok) setDevices(await devRes.json());
    if (linkRes.ok) setLinks(await linkRes.json());
    setLastUpdated(new Date());
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const online = devices.filter((d) => d.currentStatus?.isOnline).length;
  const offline = devices.length - online;
  const onlineWithPing = devices.filter(
    (d) => d.currentStatus?.isOnline && d.currentStatus.pingMs != null
  );
  const avgPing =
    onlineWithPing.length > 0
      ? Math.round(
          onlineWithPing.reduce((sum, d) => sum + (d.currentStatus!.pingMs ?? 0), 0) /
            onlineWithPing.length
        )
      : 0;

  const filtered = devices.filter((d) => {
    const typeMatch = filter === "ALL" || d.type === filter;
    const statusMatch =
      statusFilter === "ALL" ||
      (statusFilter === "ONLINE" && d.currentStatus?.isOnline) ||
      (statusFilter === "OFFLINE" && !d.currentStatus?.isOnline);
    return typeMatch && statusMatch;
  });

  return (
    <>
      <Topbar
        title="Visão Geral"
        icon={LayoutDashboard}
        subtitle={
          lastUpdated
            ? `Atualizado às ${lastUpdated.toLocaleTimeString("pt-BR")}`
            : undefined
        }
        live={!loading}
      >
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar
        </button>
        <Link href="/devices/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Link>
      </Topbar>

      <div className="p-7 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Online"
            value={online}
            icon={Wifi}
            color="success"
            loading={loading}
          />
          <KpiCard
            label="Offline"
            value={offline}
            icon={WifiOff}
            color="destructive"
            loading={loading}
          />
          <KpiCard
            label="Total de dispositivos"
            value={devices.length}
            icon={Server}
            color="muted"
            loading={loading}
          />
          <KpiCard
            label="Ping médio"
            value={avgPing}
            suffix="ms"
            icon={Activity}
            color="primary"
            loading={loading}
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          >
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
              active={filter === t}
              onClick={() => setFilter(t)}
            >
              {TYPE_LABELS[t]}
              {t !== "ALL" && (
                <span
                  className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold tabular-nums ${
                    filter === t
                      ? "bg-white/25 text-inherit"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {devices.filter((d) => d.type === t).length}
                </span>
              )}
            </FilterChip>
          ))}
        </div>

        {/* Devices grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {devices.length === 0 ? (
              <>
                <Server className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Nenhum dispositivo cadastrado.</p>
                <Link
                  href="/devices/new"
                  className={`mt-4 inline-flex ${buttonVariants({})}`}
                >
                  Cadastrar primeiro dispositivo
                </Link>
              </>
            ) : (
              <p>Nenhum dispositivo encontrado para os filtros selecionados.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        )}

        {/* Links de Internet */}
        {(loading || links.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Network className="h-4 w-4" />
                Links de Internet
              </h2>
              <Link
                href="/links"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Ver todos →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {links.map((link) => (
                  <Link key={link.id} href={`/links/${link.id}`} className="block">
                    <Card
                      className={`border-l-4 hover:bg-muted/40 transition-colors ${
                        link.isOnline ? "border-l-success" : "border-l-destructive"
                      }`}
                    >
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{link.name}</p>
                            {link.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {link.description}
                              </p>
                            )}
                            {link.lastEventAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(link.lastEventAt).toLocaleString("pt-BR", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </p>
                            )}
                          </div>
                          <StatusBadge isOnline={link.isOnline} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
