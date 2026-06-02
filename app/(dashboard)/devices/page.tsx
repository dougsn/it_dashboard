"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { DeviceTypeBadge } from "@/components/device-type-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, MapPin, Server } from "lucide-react";
import { Topbar } from "@/components/topbar";
import { formatResponseTime } from "@/lib/format";
import type { Device, DeviceStatus } from "@prisma/client";

type DeviceWithStatus = Device & { currentStatus: DeviceStatus | null };

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/devices");
    if (res.ok) setDevices(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Topbar title="Dispositivos" icon={Server} live={!loading}>
        <Link href="/devices/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Link>
      </Topbar>

    <div className="p-7 space-y-6">
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Nenhum dispositivo cadastrado.</p>
          <Link href="/devices/new" className={`mt-4 inline-flex ${buttonVariants({})}`}>
            Cadastrar primeiro dispositivo
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nome</th>
                <th className="text-left px-4 py-3 font-medium">IP</th>
                <th className="text-left px-4 py-3 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 font-medium">Localização</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Ping</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/devices/${device.id}`}
                      className="font-medium hover:underline"
                    >
                      {device.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {device.ip}
                  </td>
                  <td className="px-4 py-3">
                    <DeviceTypeBadge type={device.type} />
                  </td>
                  <td className="px-4 py-3">
                    {device.location ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {device.location}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isOnline={device.currentStatus?.isOnline ?? false} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {formatResponseTime(device.currentStatus?.pingMs)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/devices/${device.id}/edit`}
                      className={buttonVariants({ variant: "ghost", size: "icon" })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </>
  );
}
