"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { DeviceTypeBadge } from "@/components/device-type-badge";
import { MetricsChart } from "@/components/metrics-chart";
import { formatUptime, formatResponseTime, formatPercent } from "@/lib/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Topbar } from "@/components/topbar";
import { Pencil, Trash2, Cpu, MemoryStick, Clock, Wifi, Globe, Activity } from "lucide-react";
import { toast } from "sonner";
import type { Device, DeviceStatus, StatusHistory } from "@prisma/client";

type DeviceWithStatus = Device & { currentStatus: DeviceStatus | null };

export default function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [device, setDevice] = useState<DeviceWithStatus | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [devRes, histRes] = await Promise.all([
      fetch(`/api/devices/${id}`),
      fetch(`/api/status/${id}?hours=24`),
    ]);
    if (devRes.ok) setDevice(await devRes.json());
    if (histRes.ok) setHistory(await histRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(async () => {
      const r = await fetch(`/api/devices/${id}`);
      if (r.ok) setDevice(await r.json());
    }, 30_000);
    return () => clearInterval(interval);
  }, [id]);

  async function handleDelete() {
    const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Dispositivo removido");
      router.push("/devices");
    } else {
      toast.error("Erro ao remover dispositivo");
    }
  }

  if (loading) {
    return (
      <>
        <Topbar title="Carregando..." back="/devices" />
        <div className="p-7 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </>
    );
  }

  if (!device) return <div className="p-7"><p className="text-muted-foreground">Dispositivo não encontrado.</p></div>;

  const status = device.currentStatus;
  const hasMikrotikMetrics = status?.uptime != null || status?.cpuLoad != null;

  return (
    <>
      <Topbar
        title={device.name}
        badge={<StatusBadge isOnline={status?.isOnline ?? false} />}
        subtitle={`${device.ip}${device.location ? ` · ${device.location}` : ''}`}
        back="/devices"
      >
        <Link href={`/devices/${id}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Pencil className="h-4 w-4 mr-1" />
          Editar
        </Link>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Remover
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover dispositivo?</AlertDialogTitle>
              <AlertDialogDescription>
                Todo o histórico de monitoramento será apagado. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Topbar>

    <div className="p-7 space-y-6">
      {/* Metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Wifi}
          label="Ping"
          value={formatResponseTime(status?.pingMs)}
          color="text-[var(--chart-1)]"
        />
        {status?.uptime != null && (
          <MetricCard
            icon={Clock}
            label="Uptime"
            value={formatUptime(status.uptime)}
            color="text-success"
          />
        )}
        {status?.cpuLoad != null && (
          <MetricCard
            icon={Cpu}
            label="CPU"
            value={formatPercent(status.cpuLoad)}
            color="text-warning"
          />
        )}
        {status?.memoryUsed != null && (
          <MetricCard
            icon={MemoryStick}
            label="Memória"
            value={formatPercent(status.memoryUsed)}
            color="text-[var(--chart-4)]"
          />
        )}
        {status?.httpOk != null && (
          <MetricCard
            icon={Globe}
            label="HTTP"
            value={status.httpOk ? "OK" : "Falha"}
            color={status.httpOk ? "text-success" : "text-destructive"}
          />
        )}
      </div>

      {/* Protocols enabled */}
      <div className="flex flex-wrap gap-2">
        {device.pingEnabled && <Badge variant="outline">Ping</Badge>}
        {device.httpEnabled && <Badge variant="outline">HTTP :{device.httpPort ?? 80}</Badge>}
        {device.snmpEnabled && <Badge variant="outline">SNMP</Badge>}
        {device.routerosEnabled && <Badge variant="outline">RouterOS API</Badge>}
      </div>

      <Separator />

      {/* Charts */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Métricas (últimas 24h)
          </h2>
          <div className={`grid gap-4 ${hasMikrotikMetrics ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 max-w-xl"}`}>
            <Card>
              <CardContent className="pt-4">
                <MetricsChart history={history} metric="pingMs" label="Latência (ms)" color="var(--chart-1)" unit="ms" />
              </CardContent>
            </Card>
            {hasMikrotikMetrics && (
              <>
                <Card>
                  <CardContent className="pt-4">
                    <MetricsChart history={history} metric="cpuLoad" label="CPU (%)" color="var(--chart-3)" unit="%" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <MetricsChart history={history} metric="memoryUsed" label="Memória (%)" color="var(--chart-4)" unit="%" />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {/* History table */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Histórico recente</h2>
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left px-4 py-2.5 font-medium">Data/Hora</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium">Ping</th>
                  <th className="text-left px-4 py-2.5 font-medium">CPU</th>
                  <th className="text-left px-4 py-2.5 font-medium">Memória</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...history].reverse().slice(0, 50).map((h) => (
                  <tr key={h.id} className="hover:bg-muted/10">
                    <td className="px-4 py-2 font-mono text-muted-foreground">
                      {new Date(h.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge isOnline={h.isOnline} />
                    </td>
                    <td className="px-4 py-2 font-mono">{formatResponseTime(h.pingMs)}</td>
                    <td className="px-4 py-2 font-mono">{formatPercent(h.cpuLoad)}</td>
                    <td className="px-4 py-2 font-mono">{formatPercent(h.memoryUsed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {device.notes && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Observações</p>
            <p className="text-sm whitespace-pre-wrap">{device.notes}</p>
          </div>
        </>
      )}
    </div>
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-1 pt-4">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-2xl font-bold font-mono">{value}</p>
      </CardContent>
    </Card>
  );
}
