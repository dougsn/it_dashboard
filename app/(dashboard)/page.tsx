"use client";

import { useState, useEffect } from "react";
import { DeviceCard } from "@/components/device-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { RefreshCw, Plus, Wifi, WifiOff, Server, Network } from "lucide-react";
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

  const filtered = devices.filter((d) => {
    const typeMatch = filter === "ALL" || d.type === filter;
    const statusMatch =
      statusFilter === "ALL" ||
      (statusFilter === "ONLINE" && d.currentStatus?.isOnline) ||
      (statusFilter === "OFFLINE" && !d.currentStatus?.isOnline);
    return typeMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Atualizado às {lastUpdated.toLocaleTimeString("pt-BR")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Atualizar
          </Button>
          <Link href="/devices/new" className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4 mr-1" />
            Novo dispositivo
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-success/10 border border-success/20">
          <Wifi className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">{online} online</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/20">
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">{offline} offline</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
          <span className="text-sm text-muted-foreground">{devices.length} total</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "ONLINE", "OFFLINE"] as const).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s)}
          >
            {s === "ALL" ? "Todos os status" : s === "ONLINE" ? "Online" : "Offline"}
          </Button>
        ))}
        <div className="w-px bg-border mx-1" />
        {(["ALL", "MIKROTIK", "DVR", "CAMERA", "OTHER"] as const).map((t) => (
          <Button
            key={t}
            variant={filter === t ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter(t)}
          >
            {TYPE_LABELS[t]}
            {t !== "ALL" && (
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[10px]">
                {devices.filter((d) => d.type === t).length}
              </Badge>
            )}
          </Button>
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
              <Link href="/devices/new" className={`mt-4 inline-flex ${buttonVariants({})}`}>
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
            <Link href="/links" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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
                  <Card className={`border-l-4 hover:bg-muted/40 transition-colors ${link.isOnline ? "border-l-success" : "border-l-destructive"}`}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{link.name}</p>
                          {link.description && (
                            <p className="text-xs text-muted-foreground truncate">{link.description}</p>
                          )}
                          {link.lastEventAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(link.lastEventAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
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
  );
}
