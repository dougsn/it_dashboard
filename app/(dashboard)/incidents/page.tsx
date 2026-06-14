"use client";

import { useEffect, useState } from "react";
import { DeviceDetailDrawer } from "@/components/device-detail-drawer";
import { Topbar } from "@/components/topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Clock, Wifi, WifiOff } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { DEVICE_TYPE_ICON } from "@/lib/device-constants";
import { formatDuration, timeAgo, fmtTime, fmtDate } from "@/lib/format";
import { FilterChip } from "@/components/filter-chip";
import { toast } from "sonner";
import type { DeviceType } from "@prisma/client";
import type { Incident, PaginatedIncidentsResponse } from "@/app/api/incidents/route";

type Window = 24 | 168 | 720;
const WINDOWS: { label: string; value: Window }[] = [
  { label: "24h", value: 24 },
  { label: "7d", value: 168 },
  { label: "30d", value: 720 },
];


function severityColor(durationMs: number | null, resolved: boolean) {
  if (!resolved) return "text-destructive border-destructive/30 bg-destructive/5";
  if (durationMs == null) return "text-muted-foreground border-border bg-muted/30";
  const min = durationMs / 60_000;
  if (min < 5) return "text-warning border-warning/30 bg-warning/5";
  if (min < 60) return "text-orange-500 border-orange-500/30 bg-orange-500/5";
  return "text-destructive border-destructive/30 bg-destructive/5";
}


function groupByDay(incidents: Incident[]) {
  const groups: Map<string, Incident[]> = new Map();
  for (const inc of incidents) {
    const day = fmtDate(inc.startAt, { weekday: "long", day: "numeric", month: "long" });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(inc);
  }
  return groups;
}

const PAGE_LIMIT = 25;

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [window, setWindow] = useState<Window>(168);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [drawerDeviceId, setDrawerDeviceId] = useState<string | null>(null);

  const fetchPage = async (hours: number, p: number, replace: boolean) => {
    if (replace) setLoading(true);
    else setLoadingMore(true);

    try {
      const r = await fetch(`/api/incidents?hours=${hours}&page=${p}&limit=${PAGE_LIMIT}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: PaginatedIncidentsResponse = await r.json();
      setIncidents((prev) => replace ? (data.data ?? []) : [...prev, ...(data.data ?? [])]);
      setTotal(data.total ?? 0);
      setHasMore(data.hasMore ?? false);
      setPage(p);
    } catch (err) {
      console.error("[incidents] falha ao carregar página:", err);
      toast.error("Erro ao carregar incidentes");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPage(window, 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            ? `${openCount} em aberto · ${resolvedCount} resolvidos${total > incidents.length ? ` · ${total} no total` : ""}`
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
                aria-pressed={window === w.value}
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
          <EmptyState
            icon={CheckCircle2}
            iconClassName="text-success opacity-60"
            title="Nenhum incidente"
            description={
              statusFilter !== "ALL"
                ? "Sem incidentes para o filtro selecionado."
                : `Todos os dispositivos estiveram online nas últimas ${WINDOWS.find((w) => w.value === window)?.label}.`
            }
            className="py-20"
          />
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([day, items]) => (
              <div key={day} className="space-y-2">
                {/* Day label */}
                <p className="text-xs font-semibold text-muted-foreground tracking-wide px-0.5 first-letter:uppercase">
                  {day}
                </p>

                {/* Incidents for this day */}
                <div className="rounded-xl border bg-card overflow-hidden divide-y">
                  {items.map((inc) => {
                    const TypeIcon = DEVICE_TYPE_ICON[inc.deviceType];
                    const duration = formatDuration(inc.durationMs);
                    const color = severityColor(inc.durationMs, inc.resolved);

                    return (
                      <div
                        key={inc.id}
                        onClick={() => setDrawerDeviceId(inc.deviceId)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Incidente de ${inc.deviceName}`}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDrawerDeviceId(inc.deviceId); } }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                              {fmtTime(inc.startAt, { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-muted-foreground/40 text-[10px]">·</span>
                            <span className="text-[10px] text-muted-foreground">
                              {timeAgo(inc.startAt)}
                            </span>
                          </div>
                        </div>

                        {/* Right: duration + status */}
                        <div className="flex items-center gap-2 shrink-0">
                          {inc.durationMs != null && (
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

      {hasMore && (
        <div className="flex justify-center pb-8">
          <button
            onClick={() => fetchPage(window, page + 1, false)}
            disabled={loadingMore}
            className="px-5 h-9 rounded-full text-sm font-medium border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Carregando..." : `Carregar mais (${total - incidents.length} restantes)`}
          </button>
        </div>
      )}

      <DeviceDetailDrawer deviceId={drawerDeviceId} onClose={() => setDrawerDeviceId(null)} />
    </>
  );
}
