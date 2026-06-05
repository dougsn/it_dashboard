"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { Copy, Check, Activity, Clock, AlertTriangle, ArrowDown, ArrowUp, MapPin } from "lucide-react";
import { Topbar } from "@/components/topbar";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface LinkEvent {
  id: string;
  linkId: string;
  type: "UP" | "DOWN";
  timestamp: string;
}

interface LinkData {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  isOnline: boolean;
  lastEventAt: string | null;
  createdAt: string;
  downloadBps: number | null;
  uploadBps: number | null;
  latencyMs: number | null;
  mikrotikInterface: string | null;
}

interface EventsResponse {
  link: LinkData;
  events: LinkEvent[];
  lastBefore: LinkEvent | null;
  since: string;
}

type Window = 6 | 24 | 72 | 168;

function buildChartData(events: LinkEvent[], lastBefore: LinkEvent | null, sinceMs: number, currentStatus: boolean) {
  const now = Date.now();

  let state = lastBefore ? (lastBefore.type === "UP" ? 1 : 0) : (currentStatus ? 1 : 0);

  const points: { time: string; status: number; label: string }[] = [];

  function fmt(ms: number) {
    return new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  points.push({ time: fmt(sinceMs), status: state, label: new Date(sinceMs).toLocaleString("pt-BR") });

  for (const ev of events) {
    const ts = new Date(ev.timestamp).getTime();
    state = ev.type === "UP" ? 1 : 0;
    points.push({ time: fmt(ts), status: state, label: new Date(ts).toLocaleString("pt-BR") });
  }

  points.push({ time: fmt(now), status: state, label: new Date(now).toLocaleString("pt-BR") });

  return points;
}

function calcUptime(events: LinkEvent[], lastBefore: LinkEvent | null, sinceMs: number, currentStatus: boolean) {
  const now = Date.now();
  let state = lastBefore ? lastBefore.type === "UP" : currentStatus;
  let upTime = 0;
  let prev = sinceMs;

  for (const ev of events) {
    const ts = new Date(ev.timestamp).getTime();
    if (state) upTime += ts - prev;
    prev = ts;
    state = ev.type === "UP";
  }
  if (state) upTime += now - prev;

  const total = now - sinceMs;
  return total > 0 ? (upTime / total) * 100 : 100;
}

function calcOutages(events: LinkEvent[]) {
  return events.filter((e) => e.type === "DOWN").length;
}

function calcTotalDowntime(events: LinkEvent[], lastBefore: LinkEvent | null, sinceMs: number, currentStatus: boolean) {
  const now = Date.now();
  let state = lastBefore ? lastBefore.type === "UP" : currentStatus;
  let downTime = 0;
  let prev = sinceMs;

  for (const ev of events) {
    const ts = new Date(ev.timestamp).getTime();
    if (!state) downTime += ts - prev;
    prev = ts;
    state = ev.type === "UP";
  }
  if (!state) downTime += now - prev;

  return downTime;
}

function formatDuration(ms: number) {
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m`;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatBps(bps: number | null): string {
  if (bps == null) return "—";
  if (bps >= 1_000_000_000) return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
  if (bps >= 1_000_000)     return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  if (bps >= 1_000)         return `${(bps / 1_000).toFixed(0)} Kbps`;
  return `${bps} bps`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Button variant="ghost" size="icon" onClick={copy} className="h-6 w-6 shrink-0">
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

const WINDOWS: { label: string; value: Window }[] = [
  { label: "6h", value: 6 },
  { label: "24h", value: 24 },
  { label: "3d", value: 72 },
  { label: "7d", value: 168 },
];

export default function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<Window>(24);
  const [origin, setOrigin] = useState("");

  useEffect(() => { setOrigin(globalThis.window?.location.origin ?? ""); }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/links/${id}/events?hours=${window}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [id, window]);

  if (loading) {
    return (
      <>
        <Topbar title="Carregando..." back="/links" />
        <div className="p-7 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  if (!data?.link) return <div className="p-7"><p className="text-muted-foreground">Link não encontrado.</p></div>;

  const { link, events, lastBefore, since } = data;
  const sinceMs = new Date(since).getTime();
  const chartData = buildChartData(events, lastBefore, sinceMs, link.isOnline);
  const uptimePct = calcUptime(events, lastBefore, sinceMs, link.isOnline);
  const outages = calcOutages(events);
  const downtime = calcTotalDowntime(events, lastBefore, sinceMs, link.isOnline);

  return (
    <>
      <Topbar
        title={link.name}
        badge={<StatusBadge isOnline={link.isOnline} />}
        subtitle={link.description ?? undefined}
        back="/links"
      />

    <div className="p-7 space-y-6">
      {/* Webhook URLs */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">Webhooks para o Mikrotik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-4">
          {(["down", "up"] as const).map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Badge variant={type === "down" ? "destructive" : "default"} className="w-12 justify-center shrink-0">
                {type.toUpperCase()}
              </Badge>
              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                POST {origin}/api/links/{id}/{type}
              </code>
              <CopyButton text={`${origin}/api/links/${id}/${type}`} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-1">
            Configure no Mikrotik via <code className="bg-muted px-1 rounded">/tool fetch</code> em scripts de detecção de queda de WAN.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-success" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold font-mono">{uptimePct.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">últimas {WINDOWS.find((w) => w.value === window)?.label}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              Quedas
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold font-mono">{outages}</p>
            <p className="text-xs text-muted-foreground">últimas {WINDOWS.find((w) => w.value === window)?.label}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-destructive" />
              Tempo offline
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-2xl font-bold font-mono">{downtime > 0 ? formatDuration(downtime) : "—"}</p>
            <p className="text-xs text-muted-foreground">últimas {WINDOWS.find((w) => w.value === window)?.label}</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic card */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Tráfego atual
            </span>
            {link.mikrotikInterface && (
              <span className="text-[11px] font-mono bg-muted px-2 py-0.5 rounded">{link.mikrotikInterface}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {link.downloadBps == null && link.uploadBps == null ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border/60">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Monitoramento de tráfego não configurado</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Associe um Mikrotik e uma interface a este link para habilitar coleta de Download/Upload via RouterOS.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-success/5 p-4">
                <div className="w-9 h-9 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                  <ArrowDown className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">Download</p>
                  <p className="text-xl font-extrabold font-mono tabular-nums text-success leading-tight mt-0.5">
                    {formatBps(link.downloadBps)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-primary/5 p-4">
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <ArrowUp className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[9.5px] font-bold uppercase tracking-widest text-muted-foreground">Upload</p>
                  <p className="text-xl font-extrabold font-mono tabular-nums text-primary leading-tight mt-0.5">
                    {formatBps(link.uploadBps)}
                  </p>
                </div>
              </div>
            </div>
          )}
          {(link.location || link.latencyMs != null) && (
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              {link.location && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{link.location}</span>
              )}
              {link.latencyMs != null && (
                <span className="font-mono">Latência: <span className="font-semibold text-foreground">{link.latencyMs}ms</span></span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Status ao longo do tempo
            </CardTitle>
            <div className="flex gap-1">
              {WINDOWS.map((w) => (
                <Button
                  key={w.value}
                  size="sm"
                  variant={window === w.value ? "default" : "outline"}
                  onClick={() => setWindow(w.value)}
                >
                  {w.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="statusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 10 }} tickFormatter={(v) => (v === 1 ? "Online" : "Offline")} width={50} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { label: string; status: number };
                    return (
                      <div className="bg-popover border rounded-md px-3 py-2 text-xs shadow-md">
                        <p className="font-medium">{d.label}</p>
                        <p className={d.status === 1 ? "text-success" : "text-destructive"}>
                          {d.status === 1 ? "Online" : "Offline"}
                        </p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={0.5} stroke="var(--border)" strokeDasharray="4 4" />
                <Area
                  type="stepAfter"
                  dataKey="status"
                  stroke="var(--success)"
                  strokeWidth={2}
                  fill="url(#statusGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Events table */}
      <div className="space-y-3">
        <h2 className="font-semibold">Histórico de eventos</h2>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento registrado neste período.</p>
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Data/Hora</th>
                  <th className="text-left px-4 py-2.5 font-medium">Evento</th>
                  <th className="text-left px-4 py-2.5 font-medium">Duração do estado anterior</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...events].reverse().map((ev, i, arr) => {
                  const prev = arr[i + 1];
                  const duration = prev
                    ? new Date(ev.timestamp).getTime() - new Date(prev.timestamp).getTime()
                    : null;
                  return (
                    <tr key={ev.id} className="hover:bg-muted/10">
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {new Date(ev.timestamp).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={ev.type === "UP" ? "default" : "destructive"}>
                          {ev.type === "UP" ? "Voltou online" : "Ficou offline"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                        {duration != null ? formatDuration(duration) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
