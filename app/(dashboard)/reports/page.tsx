"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Topbar } from "@/components/topbar";
import { ReportView } from "@/components/report-view";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Printer, ChevronDown, Check, X, Loader2, Users, Table2 } from "lucide-react";
import { DEVICE_TYPE_ICON } from "@/lib/device-constants";
import { exportToPdf } from "@/lib/pdf-export";
import type { Device, DeviceStatus } from "@prisma/client";
import type { DeviceReport } from "@/app/api/reports/route";

type DeviceWithStatus = Device & { currentStatus: DeviceStatus | null };

const PERIOD_OPTIONS = [
  { label: "Últimas 24h",    hours: 24 },
  { label: "Últimos 7 dias", hours: 168 },
  { label: "Últimos 30 dias", hours: 720 },
];

// ── Device multi-select ───────────────────────────────────────────────────────

function DeviceSelector({
  devices,
  selected,
  onChange,
}: {
  devices: DeviceWithStatus[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  }

  const label = selected.length === 0
    ? "Selecionar dispositivos"
    : selected.length === 1
    ? devices.find(d => d.id === selected[0])?.name ?? "1 selecionado"
    : `${selected.length} dispositivos`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors min-w-[220px] justify-between"
      >
        <span className={selected.length === 0 ? "text-muted-foreground" : ""}>{label}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-72 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {selected.length} / 10 selecionados
            </span>
            {selected.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Limpar
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto">
            {devices.map(device => {
              const TypeIcon = DEVICE_TYPE_ICON[device.type];
              const isSelected = selected.includes(device.id);
              const isOnline = device.currentStatus?.isOnline ?? false;
              const disabled = !isSelected && selected.length >= 10;

              return (
                <button
                  key={device.id}
                  onClick={() => !disabled && toggle(device.id)}
                  disabled={disabled}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    isSelected ? "bg-primary/5" : disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-primary border-primary" : "border-border"
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{device.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{device.ip}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? "bg-success" : "bg-destructive"}`} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [devices, setDevices] = useState<DeviceWithStatus[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [hours, setHours] = useState(168);
  const [showClients, setShowClients] = useState(true);
  const [reports, setReports] = useState<DeviceReport[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const loadDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      const res = await fetch("/api/devices");
      if (res.ok) setDevices(await res.json());
    } finally {
      setDevicesLoading(false);
    }
  }, []);

  // Load devices and pre-select from query param (?device=id) — client-only
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deviceParam = params.get("device");
    if (deviceParam) setSelected([deviceParam]);
    loadDevices();
  }, [loadDevices]);

  // Show clients toggle only when at least one UNIFI_AP or OMADA_AP is selected
  const hasWifi = selected.some(id => ["UNIFI_AP", "OMADA_AP"].includes(devices.find(d => d.id === id)?.type ?? ""));

  async function generate() {
    if (selected.length === 0) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports?devices=${selected.join(",")}&hours=${hours}`);
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Erro ao gerar relatório.");
        return;
      }
      const data: DeviceReport[] = await res.json();
      setReports(data);
      setGeneratedAt(new Date());
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Erro de rede ao gerar relatório.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleExportPdf() {
    if (!reportRef.current) return;
    setExportingPdf(true);
    try {
      await exportToPdf(reportRef.current);
    } catch (err) {
      setError(`Erro ao gerar PDF: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setExportingPdf(false);
    }
  }

  function handleDownloadCsv() {
    if (!reports) return;
    const rows: string[] = ["dispositivo,ip,timestamp,online,ping_ms,cpu_pct,mem_pct"];
    for (const r of reports) {
      const rosMap = new Map((r.routerosHistory ?? []).map(p => [p.timestamp, p]));
      for (const p of r.pingHistory) {
        const ros = rosMap.get(p.timestamp);
        rows.push([
          `"${r.device.name.replace(/"/g, '""')}"`,
          r.device.ip,
          p.timestamp,
          p.isOnline ? "1" : "0",
          p.pingMs ?? "",
          ros?.cpuLoad ?? "",
          ros?.memoryUsed ?? "",
        ].join(","));
      }
    }
    const blob = new Blob([rows.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadHtml() {
    if (!reportRef.current) return;
    const style = Array.from(document.styleSheets)
      .map(ss => { try { return Array.from(ss.cssRules).map(r => r.cssText).join("\n"); } catch { return ""; } })
      .join("\n");
    const date = new Date().toISOString().slice(0, 10);
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório ${date} — WatchIT Tower</title>
  <style>${style}</style>
  <style>body { background: white; padding: 24px; margin: 0; }</style>
</head>
<body>${reportRef.current.innerHTML}</body>
</html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-${date}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Topbar
        title="Relatórios"
        icon={FileText}
        subtitle="Gere relatórios detalhados de saúde por dispositivo"
      />

      <div className="p-7 space-y-6">
        {/* Config bar */}
        <div className="no-print flex flex-wrap items-end gap-3 p-4 bg-card border border-border rounded-xl">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dispositivos</p>
            {devicesLoading ? (
              <Skeleton className="h-9 w-56" />
            ) : (
              <DeviceSelector
                devices={devices}
                selected={selected}
                onChange={setSelected}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Período</p>
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.hours}
                  onClick={() => setHours(opt.hours)}
                  className={`px-3 h-9 rounded-lg text-sm font-medium border transition-colors ${
                    hours === opt.hours
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clients toggle — only shown when a UniFi AP or Omada AP is selected */}
          {hasWifi && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opções Wi-Fi</p>
              <button
                onClick={() => setShowClients(v => !v)}
                className={`h-9 px-3 rounded-lg border text-sm font-medium transition-colors flex items-center gap-2 ${
                  showClients
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Users className="h-4 w-4" />
                {showClients ? "Clientes: visível" : "Clientes: oculto"}
              </button>
            </div>
          )}

          <button
            onClick={generate}
            disabled={selected.length === 0 || generating}
            className="h-9 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {generating ? "Gerando..." : "Gerar relatório"}
          </button>

          {reports && (
            <>
              <button
                onClick={handleExportPdf}
                disabled={exportingPdf}
                className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                {exportingPdf ? "Gerando PDF..." : "Exportar PDF"}
              </button>
              <button
                onClick={handleDownloadHtml}
                className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar HTML
              </button>
              <button
                onClick={handleDownloadCsv}
                className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Table2 className="h-4 w-4" />
                Exportar CSV
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="no-print px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!reports && !generating && (
          <div className="no-print text-center py-20 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Selecione os dispositivos e clique em &quot;Gerar relatório&quot;</p>
            <p className="text-sm mt-1">O relatório aparecerá aqui e poderá ser exportado como PDF ou HTML.</p>
          </div>
        )}

        {/* Generating skeleton */}
        {generating && (
          <div className="no-print space-y-4 max-w-4xl mx-auto">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        )}

        {/* Report */}
        {reports && generatedAt && (
          <div ref={reportRef}>
            <ReportView reports={reports} generatedAt={generatedAt} showClients={showClients} />
          </div>
        )}
      </div>
    </>
  );
}
