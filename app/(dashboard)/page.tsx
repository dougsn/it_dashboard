"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DeviceDetailDrawer } from "@/components/device-detail-drawer";
import { LinkDetailDrawer } from "@/components/link-detail-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Topbar } from "@/components/topbar";
import {
  RefreshCw, Plus, Wifi, WifiOff, Server, Network,
  LayoutDashboard, Activity, AlertTriangle, Router,
  HardDrive, Camera, Box, MapPin, AlertCircle,
  CheckCircle2, TrendingUp, ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { PingSparkline } from "@/components/ping-sparkline";
import type { Device, DeviceStatus, DeviceType } from "@prisma/client";
import type { HealthData } from "@/app/api/health/route";
import type { Incident } from "@/app/api/incidents/route";
import type { OverviewData, SegmentState } from "@/app/api/overview/route";

type DeviceWithStatus = Device & { currentStatus: DeviceStatus | null };

interface LinkItem {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  isOnline: boolean;
  lastEventAt: string | null;
  downloadBps: number | null;
  uploadBps: number | null;
  latencyMs: number | null;
  _count: { events: number };
}

const TYPE_LABELS: Record<DeviceType | "ALL", string> = {
  ALL: "Todos", MIKROTIK: "Mikrotik", DVR: "DVR", CAMERA: "Câmera", OTHER: "Outro",
};
const TYPE_ICON: Record<DeviceType, React.ElementType> = {
  MIKROTIK: Router, DVR: HardDrive, CAMERA: Camera, OTHER: Box,
};
const TYPE_ICON_BG: Record<DeviceType, string> = {
  MIKROTIK: "bg-primary/10 text-primary",
  DVR:      "bg-warning/10 text-warning",
  CAMERA:   "bg-destructive/10 text-destructive",
  OTHER:    "bg-muted text-muted-foreground",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
      const p = Math.min((ts - startRef.current) / duration, 1);
      setValue(Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) { rafRef.current = requestAnimationFrame(step); } else { fromRef.current = target; }
    }
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return value;
}

function offlineSince(startAt: string) {
  const diff = Date.now() - new Date(startAt).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "offline agora";
  if (m < 60) return `offline há ${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `offline há ${h}h${rem > 0 ? String(rem).padStart(2, "0") : ""}`;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, suffix, icon: Icon, iconBg, iconColor, subtitle, subtitleIcon: SubIcon, subtitleColor = "text-muted-foreground", loading }: {
  label: string; value: number; suffix?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  subtitle?: string; subtitleIcon?: React.ElementType; subtitleColor?: string; loading?: boolean;
}) {
  const animated = useCountUp(value);
  return (
    <Card className="bg-card border shadow-none">
      <CardContent className="p-5 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
          </div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
        {loading ? <Skeleton className="h-9 w-16" /> : (
          <p className="text-[2.1rem] font-extrabold leading-none tabular-nums text-foreground">
            {animated}{suffix && <span className="text-base font-semibold text-muted-foreground ml-1">{suffix}</span>}
          </p>
        )}
        {loading ? <Skeleton className="h-3 w-28" /> : subtitle ? (
          <p className={`text-xs font-medium flex items-center gap-1 ${subtitleColor}`}>
            {SubIcon && <SubIcon className="h-3 w-3" />}{subtitle}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ─── Filter chip ─────────────────────────────────────────────────────────────

function FilterChip({ active, onClick, children, color = "default" }: {
  active: boolean; onClick: () => void; children: React.ReactNode; color?: "default" | "success" | "destructive";
}) {
  const activeClass = color === "success" ? "bg-success text-white border-success" :
    color === "destructive" ? "bg-destructive text-white border-destructive" :
    "bg-primary text-primary-foreground border-primary";
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-xs font-medium border transition-all select-none whitespace-nowrap ${
      active ? activeClass : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
    }`}>{children}</button>
  );
}

// ─── Uptime gauge ────────────────────────────────────────────────────────────

function UptimeGauge({ pct, loading }: { pct: number; loading?: boolean }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);
  const color = pct >= 99 ? "var(--primary)" : pct >= 95 ? "var(--warning)" : "var(--destructive)";
  if (loading) return <Skeleton className="w-29 h-29 rounded-full mx-auto" />;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-29 h-29 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="11" className="stroke-muted" />
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="11" stroke={color} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div className="absolute text-center pointer-events-none">
        <p className="text-[17px] font-extrabold leading-none tabular-nums">{pct.toFixed(1)}%</p>
        <p className="text-[7.5px] text-muted-foreground uppercase tracking-widest mt-0.5 font-bold">UPTIME 24H</p>
      </div>
    </div>
  );
}

// ─── Problem row ─────────────────────────────────────────────────────────────

function ProblemRow({ device, offlineAt, sparkline, onClick }: {
  device: DeviceWithStatus; offlineAt?: string;
  sparkline?: (number | null)[]; onClick: () => void;
}) {
  const status = device.currentStatus;
  const isOnline = status?.isOnline ?? false;
  const isInstavel = isOnline && (status?.pingMs ?? 0) > 150;
  const TypeIcon = TYPE_ICON[device.type];

  const lossPct = sparkline && sparkline.length > 0
    ? (sparkline.filter((v) => v === null).length / sparkline.length) * 100
    : null;

  return (
    <div onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer group border-b border-border/50 last:border-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${TYPE_ICON_BG[device.type]}`}>
        <TypeIcon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{device.name}</p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
          <span className="font-mono">{device.ip}</span>
          {device.location && (<><span className="opacity-40">·</span><MapPin className="h-2.5 w-2.5" /><span>{device.location}</span></>)}
        </div>
      </div>
      {/* Sparkline */}
      {sparkline && sparkline.filter((v) => v !== null).length >= 3 && (
        <div className="hidden sm:block shrink-0">
          <PingSparkline data={sparkline} uid={`prob-${device.id}`} width={60} height={28} />
        </div>
      )}
      {/* Loss */}
      {lossPct !== null && lossPct > 0 && (
        <div className="hidden md:flex flex-col items-end shrink-0">
          <span className="text-[11px] font-mono font-semibold text-destructive/80">{lossPct.toFixed(0)}%</span>
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">perda</span>
        </div>
      )}
      <div className="shrink-0 flex items-center gap-2">
        {isInstavel ? (
          <><span className="text-[11px] font-semibold text-warning">{status?.pingMs}ms</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">Instável</span></>
        ) : (
          <>{offlineAt && <span className="text-[11px] font-semibold text-destructive/80">{offlineSince(offlineAt)}</span>}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">Offline</span></>
        )}
      </div>
    </div>
  );
}

// ─── Uptime bar (24 segments) ────────────────────────────────────────────────

const SEG_COLOR: Record<SegmentState, string> = {
  online:   "bg-success",
  offline:  "bg-destructive",
  degraded: "bg-warning",
  empty:    "bg-muted",
};

function UptimeSegments({ segments }: { segments: SegmentState[] }) {
  return (
    <div className="flex gap-0.5">
      {segments.map((s, i) => (
        <div key={i} className={`flex-1 h-4.5 rounded-[3px] ${SEG_COLOR[s]}`} />
      ))}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBps(bps: number | null): string {
  if (bps == null) return "—";
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(1)} Gbps`;
  if (bps >= 1_000_000)     return `${(bps / 1_000_000).toFixed(1)} Mbps`;
  if (bps >= 1_000)         return `${(bps / 1_000).toFixed(0)} Kbps`;
  return `${bps} bps`;
}

// ─── Device overview card ─────────────────────────────────────────────────────

function DeviceOverviewCard({ device, sparkline, onClick }: { device: DeviceWithStatus; sparkline?: (number | null)[]; onClick: () => void }) {
  const status = device.currentStatus;
  const isOnline = status?.isOnline ?? false;
  const ping = status?.pingMs;
  const isInstavel = isOnline && (ping ?? 0) > 150;
  const TypeIcon = TYPE_ICON[device.type];


  return (
    <div onClick={onClick} className="cursor-pointer">
      <Card className={`bg-card border shadow-none hover:shadow-md transition-all hover:-translate-y-0.5 h-full overflow-hidden border-l-4 ${
        isInstavel ? "border-l-warning" : isOnline ? "border-l-success" : "border-l-destructive"
      }`}>
        <CardContent className="p-4 space-y-2.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_ICON_BG[device.type]}`}>
                <TypeIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{device.name}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{device.ip}</p>
              </div>
            </div>
            {isInstavel ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 shrink-0">
                Instável
              </span>
            ) : (
              <span className={`text-xs font-semibold shrink-0 ${isOnline ? "text-success" : "text-destructive"}`}>
                {isOnline ? "Online" : "Offline"}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground font-medium">
              <TypeIcon className="h-2.5 w-2.5" />
              {TYPE_LABELS[device.type]}
            </span>
            {device.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                {device.location}
              </span>
            )}
          </div>

          {/* Ping + Sparkline */}
          <div className="flex items-end justify-between gap-2 pt-1">
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`text-[2rem] font-extrabold leading-none tabular-nums ${
                  isInstavel ? "text-warning" : isOnline ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {ping ?? "—"}
                </span>
                {ping != null && <span className="text-xs text-muted-foreground font-medium">ms</span>}
              </div>
              <p className="text-[8.5px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                PING ATUAL
              </p>
            </div>
            {sparkline && sparkline.filter(v => v !== null).length >= 3 ? (
              <div className="shrink-0">
                <PingSparkline data={sparkline} uid={device.id} />
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground/40 shrink-0">sem histórico</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const [devices, setDevices] = useState<DeviceWithStatus[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DeviceType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [drawerDeviceId, setDrawerDeviceId] = useState<string | null>(null);
  const [drawerLinkId, setDrawerLinkId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [devRes, linkRes, healthRes, incRes, ovRes] = await Promise.all([
      fetch("/api/devices"),
      fetch("/api/links"),
      fetch("/api/health"),
      fetch("/api/incidents?hours=168"),
      fetch("/api/overview"),
    ]);
    if (devRes.ok) setDevices(await devRes.json());
    if (linkRes.ok) setLinks(await linkRes.json());
    if (healthRes.ok) setHealth(await healthRes.json());
    if (incRes.ok) setIncidents(await incRes.json());
    if (ovRes.ok) setOverviewData(await ovRes.json());
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30_000); return () => clearInterval(t); }, [load]);

  const online = devices.filter((d) => d.currentStatus?.isOnline).length;
  const offline = devices.length - online;
  const instavel = devices.filter((d) => d.currentStatus?.isOnline && (d.currentStatus.pingMs ?? 0) > 150).length;
  const onlineWithPing = devices.filter((d) => d.currentStatus?.isOnline && d.currentStatus.pingMs != null);
  const avgPing = onlineWithPing.length > 0
    ? Math.round(onlineWithPing.reduce((s, d) => s + (d.currentStatus!.pingMs ?? 0), 0) / onlineWithPing.length)
    : 0;
  const pingStatus =
    avgPing === 0 ? { label: "Sem dados", color: "text-muted-foreground" } :
    avgPing < 50  ? { label: "Saudável",  color: "text-success" } :
    avgPing < 150 ? { label: "Atenção",   color: "text-warning" } :
    { label: "Crítico", color: "text-destructive" };

  const openIncidentByDevice = Object.fromEntries(
    incidents.filter((i) => !i.resolved).map((i) => [i.deviceId, i.startAt])
  );

  const offlineDevices = devices.filter((d) => !(d.currentStatus?.isOnline ?? false));
  const instavelDevices = devices.filter((d) => d.currentStatus?.isOnline && (d.currentStatus.pingMs ?? 0) > 150);
  const problemDevices = [...offlineDevices, ...instavelDevices];

  // Filtered devices for grid
  const filtered = devices.filter((d) => {
    const typeMatch = filter === "ALL" || d.type === filter;
    const statusMatch =
      statusFilter === "ALL" ||
      (statusFilter === "ONLINE" && d.currentStatus?.isOnline) ||
      (statusFilter === "OFFLINE" && !d.currentStatus?.isOnline);
    return typeMatch && statusMatch;
  });

  const linksOnline = links.filter((l) => l.isOnline).length;

  return (
    <>
      <Topbar title="Visão Geral" icon={LayoutDashboard}
        subtitle={lastUpdated ? `Atualizado às ${lastUpdated.toLocaleTimeString("pt-BR")}` : undefined}
        live={!loading}>
        <button onClick={load}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />Atualizar
        </button>
        <Link href="/devices/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4 mr-1" />Novo
        </Link>
      </Topbar>

      <div className="p-7 space-y-6">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Dispositivos online" value={online} icon={CheckCircle2}
            iconBg="bg-success/10" iconColor="text-success"
            subtitle={devices.length > 0 ? `${Math.round((online / devices.length) * 100)}% de ${devices.length} no total` : undefined}
            subtitleIcon={TrendingUp} loading={loading} />
          <KpiCard label="Offline agora" value={offline} icon={AlertTriangle}
            iconBg="bg-destructive/10" iconColor="text-destructive"
            subtitle={offline > 0 ? "Requer atenção imediata" : "Tudo operacional"}
            subtitleColor={offline > 0 ? "text-destructive" : "text-success"} loading={loading} />
          <KpiCard label="Instáveis" value={instavel} icon={Activity}
            iconBg="bg-warning/10" iconColor="text-warning"
            subtitle="latência ou perda elevada" loading={loading} />
          <KpiCard label="Latência média" value={avgPing} suffix="ms" icon={ShieldCheck}
            iconBg="bg-primary/10" iconColor="text-primary"
            subtitle={pingStatus.label}
            subtitleIcon={pingStatus.label === "Saudável" ? CheckCircle2 : undefined}
            subtitleColor={pingStatus.color} loading={loading} />
        </div>

        {/* Saúde do sistema */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Saúde do sistema
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Gauge */}
            <Card className="bg-card border shadow-none">
              <CardContent className="p-5 flex flex-col items-center gap-4">
                <UptimeGauge pct={health?.uptimePct ?? 100} loading={loading} />
                <div className="w-full space-y-2">
                  {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-3 w-full" />) :
                    [{ label: "Online", count: online, dot: "bg-success" },
                     { label: "Instáveis", count: instavel, dot: "bg-warning" },
                     { label: "Offline", count: offline, dot: "bg-destructive" }].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                          <span className="text-muted-foreground">{item.label}</span>
                        </div>
                        <span className="font-semibold tabular-nums">{item.count}</span>
                      </div>
                    ))
                  }
                </div>
                {lastUpdated && !loading && (
                  <div className="w-full pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Última verificação</span>
                    <span className="font-mono font-semibold text-foreground">{lastUpdated.toLocaleTimeString("pt-BR")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Problems panel */}
            <Card className="bg-card border shadow-none lg:col-span-3 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
                <div className="flex items-center gap-2">
                  {problemDevices.length > 0 ? <AlertCircle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
                  <span className="font-semibold text-sm">Problemas ativos</span>
                  {problemDevices.length > 0 && (
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                      {problemDevices.length}
                    </span>
                  )}
                </div>
                {problemDevices.length > 0 && (
                  <Link href="/incidents" className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">Ver todos →</Link>
                )}
              </div>
              {loading ? (
                <div>{Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-36" /><Skeleton className="h-2.5 w-24" /></div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}</div>
              ) : problemDevices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <CheckCircle2 className="h-9 w-9 text-success mb-2.5 opacity-70" />
                  <p className="text-sm font-semibold">Todos os dispositivos operacionais</p>
                  <p className="text-xs text-muted-foreground mt-1">Nenhum problema detectado no momento</p>
                </div>
              ) : (
                <div className="max-h-66 overflow-y-auto">
                  {problemDevices.slice(0, 8).map((d) => (
                    <ProblemRow key={d.id} device={d} offlineAt={openIncidentByDevice[d.id]}
                      sparkline={overviewData?.sparklines[d.id]}
                      onClick={() => setDrawerDeviceId(d.id)} />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Links de Internet */}
        {(loading || links.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Network className="h-4 w-4 text-muted-foreground" />
                Links de internet
                {!loading && links.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold">
                    {linksOnline}/{links.length} ativos
                  </span>
                )}
              </h2>
              <Link href="/links" className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">
                Gerenciar →
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : (
              <div className="rounded-xl border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/40">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Link</th>
                      <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Local</th>
                      <th className="hidden sm:table-cell text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">↓ Download</th>
                      <th className="hidden sm:table-cell text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">↑ Upload</th>
                      <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estabilidade 24h</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {links.map((link) => {
                      const segs = overviewData?.linkSegments[link.id];
                      const withData = segs?.filter((s) => s !== "empty") ?? [];
                      const uptimePct = withData.length > 0
                        ? (withData.filter((s) => s === "online" || s === "degraded").length / withData.length) * 100
                        : null;
                      return (
                        <tr key={link.id} onClick={() => setDrawerLinkId(link.id)}
                          className="hover:bg-muted/30 transition-colors cursor-pointer group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                link.isOnline ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                              }`}>
                                <Wifi className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate group-hover:text-primary transition-colors">{link.name}</p>
                                {link.description && (
                                  <p className="text-[11px] text-muted-foreground truncate">{link.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 py-3 text-xs text-muted-foreground">
                            {link.location ? (
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{link.location}</span>
                            ) : <span className="opacity-40">—</span>}
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3 text-right font-mono text-xs font-semibold text-success">
                            {link.downloadBps != null ? formatBps(link.downloadBps) : <span className="text-muted-foreground/50 font-normal">sem dados</span>}
                          </td>
                          <td className="hidden sm:table-cell px-4 py-3 text-right font-mono text-xs font-semibold text-primary">
                            {link.uploadBps != null ? formatBps(link.uploadBps) : <span className="text-muted-foreground/50 font-normal">—</span>}
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3 min-w-44">
                            {segs ? (
                              <div className="space-y-1">
                                <UptimeSegments segments={segs} />
                                {uptimePct !== null && (
                                  <p className="text-[10px] text-muted-foreground font-mono">{uptimePct.toFixed(1)}% disponível</p>
                                )}
                              </div>
                            ) : <Skeleton className="h-4.5 w-full rounded" />}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <StatusBadge isOnline={link.isOnline} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Dispositivos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2.5">
              <Server className="h-4 w-4 text-muted-foreground" />
              Dispositivos online
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold">
                amostra
              </span>
            </h2>
            <Link href="/devices" className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">
              Ver {devices.length} dispositivos →
            </Link>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            <FilterChip active={statusFilter === "ALL"} onClick={() => setStatusFilter("ALL")}>Todos os status</FilterChip>
            <FilterChip active={statusFilter === "ONLINE"} onClick={() => setStatusFilter("ONLINE")} color="success">
              <Wifi className="h-3 w-3" />Online
            </FilterChip>
            <FilterChip active={statusFilter === "OFFLINE"} onClick={() => setStatusFilter("OFFLINE")} color="destructive">
              <WifiOff className="h-3 w-3" />Offline
            </FilterChip>
            <div className="w-px bg-border mx-0.5 self-stretch" />
            {(["ALL", "MIKROTIK", "DVR", "CAMERA", "OTHER"] as const).map((t) => (
              <FilterChip key={t} active={filter === t} onClick={() => setFilter(t)}>
                {TYPE_LABELS[t]}
                {t !== "ALL" && (
                  <span className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold tabular-nums ${
                    filter === t ? "bg-white/25" : "bg-muted text-muted-foreground"
                  }`}>{devices.filter((d) => d.type === t).length}</span>
                )}
              </FilterChip>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-39 rounded-xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              {devices.length === 0 ? (
                <>
                  <Server className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum dispositivo cadastrado.</p>
                  <Link href="/devices/new" className={`mt-4 inline-flex ${buttonVariants({})}`}>Cadastrar primeiro dispositivo</Link>
                </>
              ) : <p>Nenhum dispositivo encontrado para os filtros selecionados.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.slice(0, 9).map((device) => (
                <DeviceOverviewCard
                  key={device.id}
                  device={device}
                  sparkline={overviewData?.sparklines[device.id]}
                  onClick={() => setDrawerDeviceId(device.id)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      <DeviceDetailDrawer deviceId={drawerDeviceId} onClose={() => setDrawerDeviceId(null)} />
      <LinkDetailDrawer linkId={drawerLinkId} onClose={() => setDrawerLinkId(null)} />
    </>
  );
}
