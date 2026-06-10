"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatUptime, formatResponseTime, formatPercent } from "@/lib/format";
import { DEVICE_TYPE_ICON, DEVICE_TYPE_LABEL } from "@/lib/device-constants";
import { MapPin, Users } from "lucide-react";
import type { Device, DeviceStatus } from "@prisma/client";

type DeviceWithStatus = Device & { currentStatus: DeviceStatus | null };

function pingQuality(ms: number | null | undefined): "success" | "warning" | "destructive" | "muted" {
  if (ms == null) return "muted";
  if (ms < 50) return "success";
  if (ms < 150) return "warning";
  return "destructive";
}

const QUALITY_DOT: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground/40",
};

const QUALITY_TEXT: Record<string, string> = {
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

const QUALITY_BAR: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground/30",
};

function MiniBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colorClass}`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export function DeviceCard({ device }: { device: DeviceWithStatus }) {
  const status = device.currentStatus;
  const isOnline = status?.isOnline ?? false;
  const TypeIcon = DEVICE_TYPE_ICON[device.type];
  const quality = pingQuality(status?.pingMs);
  const unifiClients = device.type === "UNIFI_AP"
    ? ((status?.unifiData as { totalClients?: number } | null)?.totalClients ?? null)
    : null;

  return (
    <Link href={`/devices/${device.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer overflow-hidden group">
        {/* Colored top accent bar */}
        <div className={`h-0.5 w-full ${isOnline ? "bg-success" : "bg-destructive"}`} />

        <CardContent className="p-4 space-y-3">
          {/* Header row */}
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center text-primary shrink-0 mt-0.5">
              <TypeIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1.5">
                <p className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
                  {device.name}
                </p>
                <StatusBadge isOnline={isOnline} />
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{device.ip}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-accent text-primary text-[10px] font-medium">
                  {DEVICE_TYPE_LABEL[device.type]}
                </span>
                {device.location && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" />
                    {device.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Metrics */}
          {status && (
            <div className="space-y-2 pt-1 border-t border-border/60">
              {/* Ping */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-8 shrink-0">Ping</span>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${QUALITY_DOT[quality]}`} />
                <span className={`text-xs font-mono font-medium ${QUALITY_TEXT[quality]}`}>
                  {formatResponseTime(status.pingMs)}
                </span>
              </div>

              {/* CPU */}
              {status.cpuLoad != null && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8 shrink-0">CPU</span>
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
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right shrink-0">
                    {formatPercent(status.cpuLoad)}
                  </span>
                </div>
              )}

              {/* Memory */}
              {status.memoryUsed != null && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8 shrink-0">Mem</span>
                  <MiniBar
                    value={status.memoryUsed}
                    colorClass={
                      status.memoryUsed < 70
                        ? "bg-primary/60"
                        : status.memoryUsed < 90
                        ? "bg-warning"
                        : "bg-destructive"
                    }
                  />
                  <span className="text-[10px] font-mono text-muted-foreground w-8 text-right shrink-0">
                    {formatPercent(status.memoryUsed)}
                  </span>
                </div>
              )}

              {/* Uptime */}
              {status.uptime != null && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8 shrink-0">Up</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatUptime(status.uptime)}
                  </span>
                </div>
              )}

              {/* UniFi clients */}
              {unifiClients != null && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8 shrink-0">Wi-Fi</span>
                  <Users className="h-3 w-3 text-sky-500 shrink-0" />
                  <span className="text-xs font-mono text-sky-500 font-semibold">
                    {unifiClients} cliente{unifiClients !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Checked at */}
              {status.checkedAt && (
                <p className="text-[10px] text-muted-foreground/60 pt-0.5">
                  Verificado às{" "}
                  {new Date(status.checkedAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              )}
            </div>
          )}

          {/* Offline placeholder */}
          {!status && (
            <div className="pt-1 border-t border-border/60">
              <p className="text-[11px] text-muted-foreground/60">Sem dados de monitoramento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
