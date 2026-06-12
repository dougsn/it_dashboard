"use client";

import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fmtDateTime } from "@/lib/format";
import {
  Database,
  Server,
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Activity,
} from "lucide-react";

interface TableStat {
  name: string;
  rowEstimate: number;
  totalSize: string;
  totalBytes: number;
}

interface Stats {
  database: { size: string; sizeBytes: number };
  tables: TableStat[];
  counts: {
    statusHistory: number;
    linkEvents: number;
    devices: number;
    users: number;
    notes: number;
    links: number;
  };
  statusHistoryRange: { oldest: string | null; newest: string | null };
  worker: { lastSeenAt: string | null; isAlive: boolean };
  retention: {
    statusHistoryDays: number;
    linkEventDays: number;
    lastCleanupAt: string | null;
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "amber" | "red" | "blue";
}) {
  const accentClass = {
    green: "text-emerald-500",
    amber: "text-amber-500",
    red: "text-destructive",
    blue: "text-primary",
  }[accent ?? "blue"];

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className={cn("flex items-center justify-center w-8 h-8 rounded-lg bg-muted", accentClass)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div>
        <div className={cn("text-2xl font-bold", accentClass)}>{value}</div>
        {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

const TABLE_LABELS: Record<string, string> = {
  StatusHistory: "Histórico de status",
  LinkEvent: "Eventos de link",
  DeviceStatus: "Status atual",
  Device: "Dispositivos",
  Link: "Links",
  Note: "Notas",
  User: "Usuários",
  WorkerHeartbeat: "Worker heartbeat",
  SystemConfig: "Configuração",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function SystemClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [retentionHistory, setRetentionHistory] = useState(30);
  const [retentionEvents, setRetentionEvents] = useState(90);
  const [saving, setSaving] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [cleanMsg, setCleanMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.ok) {
        const data: Stats = await res.json();
        setStats(data);
        setRetentionHistory(data.retention.statusHistoryDays);
        setRetentionEvents(data.retention.linkEventDays);
      } else {
        const body = await res.text();
        console.error("[system] stats API error", res.status, body);
      }
    } catch (e) {
      console.error("[system] fetch error", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  async function saveRetention() {
    setSaving(true);
    setSaveMsg(null);
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusHistoryDays: retentionHistory, linkEventDays: retentionEvents }),
    });
    if (res.ok) {
      setSaveMsg({ ok: true, text: "Configuração salva com sucesso." });
      load();
    } else {
      const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
      setSaveMsg({ ok: false, text: err.error ?? "Erro ao salvar." });
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 4000);
  }

  async function runCleanup() {
    setCleaning(true);
    setCleanMsg(null);
    const res = await fetch("/api/admin/cleanup", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setCleanMsg({
        ok: true,
        text: `Limpeza concluída: ${data.deletedStatusHistory} históricos e ${data.deletedLinkEvents} eventos removidos.`,
      });
      load();
    } else {
      setCleanMsg({ ok: false, text: "Erro ao executar limpeza." });
    }
    setCleaning(false);
    setTimeout(() => setCleanMsg(null), 6000);
  }

  const totalRows = stats
    ? stats.counts.statusHistory + stats.counts.linkEvents + stats.counts.devices + stats.counts.users + stats.counts.notes + stats.counts.links
    : 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Topbar
        title="Sistema"
        subtitle="Métricas do banco de dados e controle de retenção de logs"
      >
        <button
          onClick={() => { setLoading(true); load(); }}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Atualizar
        </button>
      </Topbar>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Database}
            label="Tamanho do banco"
            value={stats?.database.size ?? "—"}
            sub={stats ? formatBytes(stats.database.sizeBytes) : undefined}
            accent="blue"
          />
          <StatCard
            icon={Server}
            label="Total de registros"
            value={stats ? totalRows.toLocaleString("pt-BR") : "—"}
            sub={`${stats?.counts.statusHistory.toLocaleString("pt-BR") ?? 0} histórico de status`}
            accent="blue"
          />
          <StatCard
            icon={Activity}
            label="Worker"
            value={stats ? (stats.worker.isAlive ? "Ativo" : "Inativo") : "—"}
            sub={stats?.worker.lastSeenAt ? `Visto: ${fmtDateTime(stats.worker.lastSeenAt)}` : "Sem dados"}
            accent={stats ? (stats.worker.isAlive ? "green" : "red") : "blue"}
          />
          <StatCard
            icon={Clock}
            label="Última limpeza"
            value={stats?.retention.lastCleanupAt ? fmtDateTime(stats.retention.lastCleanupAt) : "Nunca"}
            sub={`Retenção: ${stats?.retention.statusHistoryDays ?? "—"} dias`}
            accent="amber"
          />
        </div>

        {/* Table breakdown */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px] font-semibold">Tabelas do banco de dados</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 font-semibold text-muted-foreground">Tabela</th>
                  <th className="text-right px-5 py-2.5 font-semibold text-muted-foreground">Registros (estimativa)</th>
                  <th className="text-right px-5 py-2.5 font-semibold text-muted-foreground">Tamanho total</th>
                  <th className="text-right px-5 py-2.5 font-semibold text-muted-foreground">% do banco</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                      Carregando…
                    </td>
                  </tr>
                )}
                {stats?.tables.map((t) => {
                  const pct = stats.database.sizeBytes > 0
                    ? ((t.totalBytes / stats.database.sizeBytes) * 100).toFixed(1)
                    : "0.0";
                  const label = TABLE_LABELS[t.name] ?? t.name;
                  return (
                    <tr key={t.name} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-medium">
                        <span className="text-foreground">{label}</span>
                        <span className="text-muted-foreground ml-1.5 text-[11px]">{t.name}</span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {t.rowEstimate.toLocaleString("pt-BR")}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">{t.totalSize}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(parseFloat(pct), 100)}%` }}
                            />
                          </div>
                          <span className="tabular-nums text-muted-foreground text-[12px] w-10 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contagens por entidade */}
        {stats && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "Dispositivos", value: stats.counts.devices },
              { label: "Links", value: stats.counts.links },
              { label: "Histórico", value: stats.counts.statusHistory },
              { label: "Eventos", value: stats.counts.linkEvents },
              { label: "Notas", value: stats.counts.notes },
              { label: "Usuários", value: stats.counts.users },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-card px-4 py-3 text-center"
              >
                <div className="text-xl font-bold tabular-nums">{value.toLocaleString("pt-BR")}</div>
                <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Range de histórico */}
        {stats?.statusHistoryRange.oldest && (
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex flex-wrap gap-6 text-[13px]">
            <div>
              <span className="text-muted-foreground">Registro mais antigo:</span>{" "}
              <span className="font-semibold">{fmtDateTime(stats.statusHistoryRange.oldest)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Registro mais recente:</span>{" "}
              <span className="font-semibold">
                {stats.statusHistoryRange.newest ? fmtDateTime(stats.statusHistoryRange.newest) : "—"}
              </span>
            </div>
          </div>
        )}

        {/* Retention settings */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-[13px] font-semibold">Retenção de logs</span>
          </div>
          <div className="p-5 space-y-5">
            <p className="text-[13px] text-muted-foreground">
              Registros mais antigos que o período configurado são removidos automaticamente
              pelo worker a cada 24 horas, ou manualmente pelo botão abaixo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="hist-days" className="text-[13px]">
                  Histórico de status (StatusHistory)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="hist-days"
                    type="number"
                    min={1}
                    max={365}
                    value={retentionHistory}
                    onChange={(e) => setRetentionHistory(Number(e.target.value))}
                    className="w-28 text-[13px]"
                  />
                  <span className="text-[13px] text-muted-foreground">dias</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Atualmente {stats?.counts.statusHistory.toLocaleString("pt-BR") ?? "—"} registros
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="event-days" className="text-[13px]">
                  Eventos de link (LinkEvent)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="event-days"
                    type="number"
                    min={1}
                    max={365}
                    value={retentionEvents}
                    onChange={(e) => setRetentionEvents(Number(e.target.value))}
                    className="w-28 text-[13px]"
                  />
                  <span className="text-[13px] text-muted-foreground">dias</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Atualmente {stats?.counts.linkEvents.toLocaleString("pt-BR") ?? "—"} registros
                </p>
              </div>
            </div>

            {saveMsg && (
              <div className={cn("flex items-center gap-2 text-[13px] rounded-lg px-3 py-2",
                saveMsg.ok ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
              )}>
                {saveMsg.ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                {saveMsg.text}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button onClick={saveRetention} disabled={saving} size="sm">
                {saving ? "Salvando…" : "Salvar configuração"}
              </Button>
            </div>
          </div>
        </div>

        {/* Manual cleanup */}
        <div className="rounded-xl border border-destructive/30 bg-card">
          <div className="px-5 py-3.5 border-b border-destructive/30 flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="text-[13px] font-semibold">Limpeza manual</span>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-[13px] text-muted-foreground">
              Remove imediatamente todos os registros além do período de retenção configurado.
              Esta operação é irreversível.
            </p>

            {cleanMsg && (
              <div className={cn("flex items-center gap-2 text-[13px] rounded-lg px-3 py-2",
                cleanMsg.ok ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
              )}>
                {cleanMsg.ok ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                {cleanMsg.text}
              </div>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={runCleanup}
              disabled={cleaning}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {cleaning ? "Limpando…" : "Executar limpeza agora"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
