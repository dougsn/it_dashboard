"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Layers } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  ipStart: z.string().min(1, "IP inicial é obrigatório"),
  ipEnd: z.string().min(1, "IP final é obrigatório"),
  type: z.enum(["MIKROTIK", "DVR", "CAMERA", "OTHER"]),
  location: z.string().optional(),
  notes: z.string().optional(),
  pingEnabled: z.boolean(),
  httpEnabled: z.boolean(),
  httpPort: z.number().optional().nullable(),
  httpPath: z.string(),
  snmpEnabled: z.boolean(),
  snmpCommunity: z.string(),
  snmpPort: z.number(),
  routerosEnabled: z.boolean(),
  routerosUser: z.string().optional().nullable(),
  routerosPass: z.string().optional().nullable(),
  routerosPort: z.number(),
  checkInterval: z.number().min(10).max(3600),
});

type FormData = z.infer<typeof schema>;

function ipToInt(ip: string): number | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}

function expandRange(start: string, end: string): string[] | null {
  const s = ipToInt(start);
  const e = ipToInt(end);
  if (s === null || e === null || s > e || e - s >= 254) return null;
  const ips: string[] = [];
  for (let n = s; n <= e; n++) ips.push(intToIp(n));
  return ips;
}

export function BulkDeviceForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "CAMERA",
      pingEnabled: true,
      httpEnabled: false,
      httpPath: "/",
      snmpEnabled: false,
      snmpCommunity: "public",
      snmpPort: 161,
      routerosEnabled: false,
      routerosPort: 8728,
      checkInterval: 60,
    },
  });

  const ipStart = watch("ipStart") ?? "";
  const ipEnd = watch("ipEnd") ?? "";
  const httpEnabled = watch("httpEnabled");
  const snmpEnabled = watch("snmpEnabled");
  const routerosEnabled = watch("routerosEnabled");

  const preview = useCallback(() => {
    if (!ipStart || !ipEnd) return null;
    return expandRange(ipStart, ipEnd);
  }, [ipStart, ipEnd]);

  const ips = preview();
  const rangeError = ipStart && ipEnd && ips === null
    ? (ipToInt(ipStart) !== null && ipToInt(ipEnd) !== null && (ipToInt(ipStart)! > ipToInt(ipEnd)!)
      ? "IP inicial maior que o final"
      : "Máximo de 254 IPs por operação")
    : null;

  async function onSubmit(data: FormData) {
    if (!ips || ips.length === 0) {
      toast.error("Range de IPs inválido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/devices/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha ao criar dispositivos");
      toast.success(`${json.created} dispositivo(s) cadastrado(s) com sucesso!`);
      router.push("/devices");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar dispositivos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Range de IPs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name")} placeholder="Câmera IP" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            <p className="text-xs text-muted-foreground">
              O mesmo nome será usado para todos os dispositivos.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ipStart">IP inicial *</Label>
              <Input
                id="ipStart"
                {...register("ipStart")}
                placeholder="192.168.1.10"
                className="font-mono"
              />
              {errors.ipStart && <p className="text-xs text-destructive">{errors.ipStart.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipEnd">IP final *</Label>
              <Input
                id="ipEnd"
                {...register("ipEnd")}
                placeholder="192.168.1.50"
                className="font-mono"
              />
              {errors.ipEnd && <p className="text-xs text-destructive">{errors.ipEnd.message}</p>}
            </div>
          </div>

          {/* Range feedback */}
          {rangeError ? (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive font-medium">{rangeError}</p>
            </div>
          ) : ips && ips.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <p className="text-xs text-success font-medium">
                  {ips.length} dispositivo{ips.length !== 1 ? "s" : ""} será{ips.length !== 1 ? "ão" : ""} criado{ips.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 max-h-36 overflow-y-auto">
                <div className="grid grid-cols-4 gap-x-2 p-2">
                  {ips.map((ip) => (
                    <span key={ip} className="font-mono text-xs text-muted-foreground py-0.5">
                      {ip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                defaultValue="CAMERA"
                onValueChange={(v) => setValue("type", v as FormData["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MIKROTIK">Mikrotik</SelectItem>
                  <SelectItem value="DVR">DVR</SelectItem>
                  <SelectItem value="CAMERA">Câmera</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input id="location" {...register("location")} placeholder="Estacionamento" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkInterval">Intervalo de verificação (segundos)</Label>
            <Input
              id="checkInterval"
              type="number"
              min={10}
              max={3600}
              {...register("checkInterval", { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Protocols */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Protocolos de Monitoramento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Ping (ICMP)</p>
              <p className="text-xs text-muted-foreground">Verificação básica de disponibilidade</p>
            </div>
            <Switch
              checked={watch("pingEnabled")}
              onCheckedChange={(v) => setValue("pingEnabled", v)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">HTTP Check</p>
                <p className="text-xs text-muted-foreground">Verifica se a interface web responde</p>
              </div>
              <Switch
                checked={httpEnabled}
                onCheckedChange={(v) => setValue("httpEnabled", v)}
              />
            </div>
            {httpEnabled && (
              <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
                <div className="space-y-1">
                  <Label className="text-xs">Porta HTTP</Label>
                  <Input
                    type="number"
                    placeholder="80"
                    {...register("httpPort", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Caminho</Label>
                  <Input placeholder="/" {...register("httpPath")} />
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">SNMP</p>
                <p className="text-xs text-muted-foreground">Métricas via protocolo SNMP v2c</p>
              </div>
              <Switch
                checked={snmpEnabled}
                onCheckedChange={(v) => setValue("snmpEnabled", v)}
              />
            </div>
            {snmpEnabled && (
              <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
                <div className="space-y-1">
                  <Label className="text-xs">Community</Label>
                  <Input placeholder="public" {...register("snmpCommunity")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Porta SNMP</Label>
                  <Input
                    type="number"
                    placeholder="161"
                    {...register("snmpPort", { valueAsNumber: true })}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">RouterOS API</p>
                <p className="text-xs text-muted-foreground">Métricas detalhadas de Mikrotik</p>
              </div>
              <Switch
                checked={routerosEnabled}
                onCheckedChange={(v) => setValue("routerosEnabled", v)}
              />
            </div>
            {routerosEnabled && (
              <div className="grid grid-cols-3 gap-3 pl-4 border-l-2 border-muted">
                <div className="space-y-1">
                  <Label className="text-xs">Usuário</Label>
                  <Input placeholder="admin" {...register("routerosUser")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Senha</Label>
                  <Input type="password" {...register("routerosPass")} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Porta API</Label>
                  <Input
                    type="number"
                    placeholder="8728"
                    {...register("routerosPort", { valueAsNumber: true })}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !ips || ips.length === 0}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <Layers className="h-4 w-4" />
          {loading ? "Criando..." : `Criar ${ips?.length ?? 0} dispositivo${(ips?.length ?? 0) !== 1 ? "s" : ""}`}
        </button>
        <button
          type="button"
          onClick={() => router.push("/devices")}
          className="inline-flex items-center h-10 px-5 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
