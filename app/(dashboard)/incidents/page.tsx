"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/topbar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  CheckCircle2,
  Router,
  HardDrive,
  Camera,
  Box,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { DeviceType } from "@prisma/client";
import type { Incident } from "@/app/api/incidents/route";

const TYPE_ICON: Record<DeviceType, React.ElementType> = {
  MIKROTIK: Router,
  DVR: HardDrive,
  CAMERA: Camera,
  OTHER: Box,
};

type Window = 24 | 168 | 720;
const WINDOWS: { label: string; value: Window }[] = [
  { label: "24h", value: 24 },
  { label: "7d", value: 168 },
  { label: "30d", value: 720 },
];

function formatDuration(ms: number | null) {
  if (ms == null) return null;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

function severityColor(durationMs: number | null, resolved: boolean) {
  if (!resolved) return "text-destructive border-destructive/30 bg-destructive/5";
  if (durationMs == null) return "text-muted-foreground border-border bg-muted/30";
  const min = durationMs / 60_000;
  if (min < 5) return "text-warning border-warning/30 bg-warning/5";
  if (min < 60) return "text-orange-500 border-orange-500/30 bg-orange-500/5";
  return "text-destructive border-destructive/30 bg-destructive/5";
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

function groupByDay(incidents: Incident[]) {
  const groups: Map<string, Incident[]> = new Map();
  for (const inc of incidents) {
    const day = new Date(inc.startAt).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(inc);
  }
  return groups;
}

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<Window>(168);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/incidents?hours=${window}`)
      .then((r) => r.json())
      .then((data) => {
        setIncidents(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [window]);

  const filtered = incidents.filter((inc) => {
    if (statusFilter === "OPEN") return !inc.resolved;
    if (statusFilter === "RESOLVED") return inc.resolved;
    return true;
  });

  const openCount = incidents.filter((i) => !i.resolved).length;
  const resolvedCount = incidents.filter((i) => i.resolved).length;

  const grouped = groupByDay(filtered);

  return (
    <>
      <Topbar
        title="Incidentes"
        icon={AlertCircle}
        subtitle={
          !loading
            ? `${openCount} em aberto · ${resolvedCount} resolvidos`
            : undefined
        }
        live={!loading && openCount > 0}
      />

      <div className="p-7 space-y-4">
        {/* Filters */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={statusFilter === "ALL"}
              onClick={() => setStatusFilter("ALL")}
            >
              Todos ({incidents.length})
            </FilterChip>
            <FilterChip
              active={statusFilter === "OPEN"}
              onClick={() => setStatusFilter("OPEN")}
              color="destructive"
            >
              <WifiOff className="h-3 w-3" />
              Em aberto ({openCount})
            </FilterChip>
            <FilterChip
              active={statusFilter === "RESOLVED"}
              onClick={() => setStatusFilter("RESOLVED")}
              color="success"
            >
              <Wifi className="h-3 w-3" />
              Resolvidos ({resolvedCount})
            </FilterChip>
          </div>

          {/* Time window */}
          <div className="flex items-center gap-1">
            {WINDOWS.map((w) => (
              <button
                key={w.value}
                onClick={() => setWindow(w.value)}
                className={`px-3 h-7 rounded-full text-xs font-medium border transition-all ${
                  window === w.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((g) => (
              <div key={g} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-success opacity-60" />
            <p className="font-medium text-foreground">Nenhum incidente</p>
            <p className="text-sm mt-1">
              {statusFilter !== "ALL"
                ? "Sem incidentes para o filtro selecionado."
                : `Todos os dispositivos estiveram online nas últimas ${WINDOWS.find((w) => w.value === window)?.label}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([day, items]) => (
              <div key={day} className="space-y-2">
                {/* Day label */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-0.5 capitalize">
                  {day}
                </p>

                {/* Incidents for this day */}
                <div className="rounded-xl border bg-card overflow-hidden divide-y">
                  {items.map((inc) => {
                    const TypeIcon = TYPE_ICON[inc.deviceType];
                    const duration = formatDuration(inc.durationMs);
                    const color = severityColor(inc.durationMs, inc.resolved);

                    return (
                      <div
                        key={inc.id}
                        onClick={() => router.push(`/devices/${inc.deviceId}`)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer group"
                      >
                        {/* Status indicator */}
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${color}`}
                        >
                          {inc.resolved ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </div>

                        {/* Device icon */}
                        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-primary shrink-0">
                          <TypeIcon className="h-3.5 w-3.5" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {inc.deviceName}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-2.5 w-2.5" />
                              {new Date(inc.startAt).toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="text-muted-foreground/40 text-[10px]">·</span>
                            <span className="text-[10px] text-muted-foreground">
                              {timeAgo(inc.startAt)}
                            </span>
                          </div>
                        </div>

                        {/* Right: duration + status */}
                        <div className="flex items-center gap-2 shrink-0">
                          {duration && (
                            <span
                              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${color}`}
                            >
                              {duration}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              inc.resolved
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            }`}
                          >
                            {inc.resolved ? "Resolvido" : "Em aberto"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
