"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Wifi, MapPin, History, Zap, X, AlertTriangle, ArrowDown, ArrowUp } from "lucide-react";
import { formatBps, formatDuration, fmtDateTime, fmtDate } from "@/lib/format";

type SegState = "online" | "offline" | "degraded" | "empty";

const SEG_COLOR: Record<SegState, string> = {
  online: "bg-success", offline: "bg-destructive",
  degraded: "bg-warning", empty: "bg-muted/60",
};

interface LinkEvent {
  id: string; linkId: string; type: "UP" | "DOWN"; timestamp: string;
}
interface LinkData {
  id: string; name: string; description: string | null;
  location: string | null; isOnline: boolean;
  lastEventAt: string | null; createdAt: string;
  downloadBps: number | null; uploadBps: number | null; latencyMs: number | null;
  mikrotikInterface: string | null;
}

interface EventsResponse {
  link: LinkData; events: LinkEvent[]; lastBefore: LinkEvent | null; since: string;
}

// ─── Uptime from events ──────────────────────────────────────────────────────

function calcUptimePct(events: LinkEvent[], lastBefore: LinkEvent | null, sinceMs: number, currentStatus: boolean) {
  const now = Date.now();
  let state = lastBefore ? lastBefore.type === "UP" : currentStatus;
  let up = 0, prev = sinceMs;
  for (const ev of events) {
    const t = new Date(ev.timestamp).getTime();
    if (state) up += t - prev;
    prev = t; state = ev.type === "UP";
  }
  if (state) up += now - prev;
  const total = now - sinceMs;
  return total > 0 ? (up / total) * 100 : 100;
}

function buildSegments(events: LinkEvent[], lastBefore: LinkEvent | null, sinceMs: number, currentStatus: boolean): SegState[] {
  const now = Date.now();
  return Array.from({ length: 48 }, (_, i) => {
    const segEnd = now - i * 1_800_000;
    const segStart = segEnd - 1_800_000;
    if (segStart < sinceMs) return "empty";
    const inSeg = events.filter((e) => {
      const t = new Date(e.timestamp).getTime();
      return t >= segStart && t < segEnd;
    });
    if (inSeg.length === 0) {
      const before = [lastBefore, ...events].filter(Boolean)
        .filter((e) => new Date(e!.timestamp).getTime() < segStart) as LinkEvent[];
      if (before.length === 0) return currentStatus ? "online" : "offline";
      return before[before.length - 1].type === "UP" ? "online" : "offline";
    }
    const hasDown = inSeg.some((e) => e.type === "DOWN");
    if (!hasDown) return "online";
    return inSeg[inSeg.length - 1].type === "UP" ? "degraded" : "offline";
  }).reverse();
}

function calcOutages(events: LinkEvent[]) {
  return events.filter((e) => e.type === "DOWN").length;
}


// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricTile({ label, value, loading }: { label: string; value: string | null; loading?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3.5">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      {loading ? <Skeleton className="h-7 w-20" /> : (
        <p className="text-[1.6rem] font-extrabold leading-none tabular-nums text-foreground">
          {value ?? "—"}
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-right">{value}</span>
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface Props { linkId: string | null; onClose: () => void; }

export function LinkDetailDrawer({ linkId, onClose }: Props) {
  const [data, setData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${id}/events?hours=720`, { signal });
      if (res.ok) setData(await res.json());
    } catch (err) {
      if (signal?.aborted || (err instanceof DOMException && err.name === "AbortError")) return;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Lightweight traffic-only refresh: just re-fetch the link object
  const refreshTraffic = useCallback(async (id: string, signal?: AbortSignal) => {
    try {
      const res = await fetch(`/api/links/${id}/events?hours=720`, { signal });
      if (res.ok) setData(await res.json());
    } catch { /* ignore transient/aborted */ }
  }, []);

  useEffect(() => {
    if (!linkId) { setData(null); return; }
    const controller = new AbortController();
    fetchData(linkId, controller.signal);
    const t = setInterval(() => refreshTraffic(linkId, controller.signal), 30_000);
    return () => { clearInterval(t); controller.abort(); };
  }, [linkId, fetchData, refreshTraffic]);

  const link = data?.link;
  const events = data?.events ?? [];
  const lastBefore = data?.lastBefore ?? null;
  const sinceMs = data ? new Date(data.since).getTime() : Date.now() - 30 * 24 * 3_600_000;

  const uptime30d = link ? calcUptimePct(events, lastBefore, sinceMs, link.isOnline) : null;
  const outages   = calcOutages(events);

  // 24h window stats
  const since24h  = Date.now() - 24 * 3_600_000;
  const events24h = events.filter((e) => new Date(e.timestamp).getTime() >= since24h);
  const uptime24h = link
    ? calcUptimePct(events24h, lastBefore, since24h, link.isOnline)
    : null;

  // Total downtime in the 30d window
  const now = Date.now();
  let downMs = 0;
  {
    let state = lastBefore ? lastBefore.type === "UP" : (link?.isOnline ?? true);
    let prev = sinceMs;
    for (const ev of events) {
      const t = new Date(ev.timestamp).getTime();
      if (!state) downMs += t - prev;
      prev = t; state = ev.type === "UP";
    }
    if (!state) downMs += now - prev;
  }

  const segments = link
    ? buildSegments(events24h, lastBefore, since24h, link.isOnline)
    : Array(48).fill("empty" as SegState);

  return (
    <Sheet open={linkId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" showCloseButton={false}
        className="sm:max-w-[420px] w-full p-0 flex flex-col gap-0 overflow-y-auto">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border shrink-0">
          {loading || !link ? (
            <div className="space-y-2 pr-8">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="space-y-1.5 flex-1"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-28" /></div>
              </div>
              <Skeleton className="h-5 w-14" />
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  link.isOnline ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  <Wifi className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[15px] leading-tight truncate">{link.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    {link.description && <span>{link.description}</span>}
                    {link.description && <span className="opacity-40">·</span>}
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>Link de internet</span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      link.isOnline
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {link.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose}
                aria-label="Fechar painel"
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 px-5 py-5 space-y-5">

          {/* Metrics 2×2 */}
          <div className="grid grid-cols-2 gap-2.5">
            <MetricTile label="Uptime 30d" value={uptime30d != null ? `${uptime30d.toFixed(2)}%` : null} loading={loading} />
            <MetricTile label="Uptime 24h" value={uptime24h != null ? `${uptime24h.toFixed(2)}%` : null} loading={loading} />
            <MetricTile label="Quedas (30d)" value={loading ? null : String(outages)} loading={loading} />
            <MetricTile label="Tempo offline" value={loading ? null : (downMs > 0 ? formatDuration(downMs) : "0")} loading={loading} />
          </div>

          {/* Traffic */}
          {!loading && link && (
            link.downloadBps != null || link.uploadBps != null ? (
              <div className="space-y-2">
                <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span>Tráfego atual</span>
                  {link.mikrotikInterface && (
                    <span className="font-mono normal-case bg-muted px-1.5 py-0.5 rounded text-[10px]">{link.mikrotikInterface}</span>
                  )}
                </p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-success/5 px-3 py-2.5 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-success/15 flex items-center justify-center shrink-0">
                      <ArrowDown className="h-3 w-3 text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5">Download</p>
                      <p className="text-[0.95rem] font-extrabold font-mono tabular-nums text-success leading-none whitespace-nowrap">
                        {formatBps(link.downloadBps)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-primary/5 px-3 py-2.5 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
                      <ArrowUp className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-0.5">Upload</p>
                      <p className="text-[0.95rem] font-extrabold font-mono tabular-nums text-primary leading-none whitespace-nowrap">
                        {formatBps(link.uploadBps)}
                      </p>
                    </div>
                  </div>
                </div>
                {link.latencyMs != null && (
                  <p className="text-[11px] text-muted-foreground font-mono px-0.5">
                    Latência: <span className="font-semibold text-foreground">{link.latencyMs}ms</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/40 border border-border/60">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Tráfego não monitorado</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Associe um Mikrotik e uma interface a este link para habilitar Download/Upload via RouterOS.
                  </p>
                </div>
              </div>
            )
          )}

          {/* Availability bar 24h */}
          <div className="space-y-2">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">
              Disponibilidade (24h)
            </p>
            {loading ? <Skeleton className="h-5 w-full rounded" /> : (
              <div className="flex gap-0.5">
                {segments.map((s, i) => (
                  <div key={i} className={`flex-1 h-5 rounded-[3px] ${SEG_COLOR[s as SegState]}`} />
                ))}
              </div>
            )}
          </div>

          {/* Link info table */}
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Informações do link
            </p>
            {loading ? (
              <div className="space-y-1">{Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between py-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-20" /></div>
              ))}</div>
            ) : link ? (
              <div>
                <InfoRow label="Tipo" value="Link de internet" />
                {link.description && <InfoRow label="Descrição" value={link.description} />}
                <InfoRow label="Uptime 30d" value={uptime30d != null ? `${uptime30d.toFixed(2)}%` : "—"} />
                {link.lastEventAt && (
                  <InfoRow label="Último evento"
                    value={fmtDateTime(link.lastEventAt, { dateStyle: "short", timeStyle: "short" })} />
                )}
                <InfoRow label="Cadastrado em"
                  value={fmtDate(link.createdAt)} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        {link && (
          <div className="px-5 py-4 border-t border-border flex gap-2.5 shrink-0">
            <button onClick={() => linkId && fetchData(linkId)}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity">
              <Zap className="h-4 w-4" />{loading ? "Atualizando..." : "Testar agora"}
            </button>
            <Link href={`/links/${link.id}`} onClick={onClose}
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors">
              <History className="h-4 w-4" />Histórico
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
