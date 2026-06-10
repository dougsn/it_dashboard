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
import { AlertCircle, CheckCircle, CheckCircle2, Layers, Loader2, XCircle } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  ipStart: z.string().min(1, "IP inicial é obrigatório"),
  ipEnd: z.string().min(1, "IP final é obrigatório"),
  type: z.enum(["MIKROTIK", "UNIFI_AP", "DVR", "CAMERA", "OTHER"]),
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
  unifiEnabled: z.boolean(),
  unifiAuthMethod: z.enum(["apikey", "userpass"]),
  unifiApiKey: z.string().optional().nullable(),
  unifiUser: z.string().optional().nullable(),
  unifiPass: z.string().optional().nullable(),
  unifiPort: z.number(),
  unifiSite: z.string(),
  unifiTlsVerify: z.boolean(),
  unifiMode: z.enum(["standalone", "controller"]),
  unifiControllerIp: z.string().optional().nullable(),
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
  const [unifiTest, setUnifiTest] = useState<{ status: "idle" | "testing" | "ok" | "error"; message?: string }>({ status: "idle" });

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
      unifiEnabled: false,
      unifiAuthMethod: "apikey",
      unifiPort: 443,
      unifiSite: "default",
      unifiTlsVerify: false,
      unifiMode: "standalone",
      checkInterval: 60,
    },
  });

  const ipStart        = watch("ipStart") ?? "";
  const ipEnd          = watch("ipEnd") ?? "";
  const httpEnabled    = watch("httpEnabled");
  const snmpEnabled    = watch("snmpEnabled");
  const routerosEnabled = watch("routerosEnabled");
  const unifiEnabled   = watch("unifiEnabled");
  const unifiAuthMethod = watch("unifiAuthMethod");
  const unifiMode      = watch("unifiMode");

  const preview = useCallback(() => {
    if (!ipStart || !ipEnd) return null;
    return expandRange(ipStart, ipEnd);
  }, [ipStart, ipEnd]);

  const ips = preview();
  async function testUnifiConnection() {
    const values = watch();
    const controllerIp =
      values.unifiMode === "controller" && values.unifiControllerIp
        ? values.unifiControllerIp
        : null;

    if (!controllerIp) {
      setUnifiTest({ status: "error", message: "Informe o IP do controlador no modo Cloud Key / Controller" });
      return;
    }

    setUnifiTest({ status: "testing" });
    try {
      const res = await fetch("/api/devices/test-unifi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controllerIp,
          port: values.unifiPort,
          site: values.unifiSite,
          tlsVerify: values.unifiTlsVerify,
          authMethod: values.unifiAuthMethod,
          apiKey: values.unifiApiKey || undefined,
          unifiUser: values.unifiUser || undefined,
          unifiPass: values.unifiPass || undefined,
        }),
      });
      const json = await res.json() as { ok?: boolean; message?: string; error?: string };
      if (res.ok && json.ok) {
        setUnifiTest({ status: "ok", message: json.message });
      } else {
        setUnifiTest({ status: "error", message: json.error ?? "Falha no teste" });
      }
    } catch {
      setUnifiTest({ status: "error", message: "Erro de rede ao testar conexão" });
    }
  }

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
      const { unifiMode: _mode, ...rest } = data;
      const payload = {
        ...rest,
        unifiControllerIp:
          data.unifiMode === "controller" && data.unifiControllerIp
            ? data.unifiControllerIp
            : null,
        unifiApiKey: data.unifiAuthMethod === "apikey" ? (data.unifiApiKey || undefined) : "",
        unifiUser:   data.unifiAuthMethod === "userpass" ? (data.unifiUser || undefined) : "",
        unifiPass:   data.unifiAuthMethod === "userpass" ? (data.unifiPass || undefined) : "",
      };
      const res = await fetch("/api/devices/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
                  <SelectItem value="UNIFI_AP">UniFi AP</SelectItem>
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
                  <PasswordInput {...register("routerosPass")} />
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

          <Separator />

          {/* UniFi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">UniFi Controller API</p>
                <p className="text-xs text-muted-foreground">SSIDs, clientes e tráfego de APs UniFi</p>
              </div>
              <Switch
                checked={unifiEnabled}
                onCheckedChange={(v) => setValue("unifiEnabled", v)}
              />
            </div>
            {unifiEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-muted">
                {/* Auth method */}
                <div className="space-y-2">
                  <Label className="text-xs">Método de autenticação</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["apikey", "userpass"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setValue("unifiAuthMethod", m)}
                        className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                          unifiAuthMethod === m
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-border text-muted-foreground hover:border-muted-foreground"
                        }`}
                      >
                        <p className="font-medium">{m === "apikey" ? "Chave de API" : "Usuário e senha"}</p>
                        <p className="text-[10px] opacity-70 mt-0.5">
                          {m === "apikey"
                            ? "Gerada em Settings → Integrations"
                            : "Login local do controlador (RSSI + SSID)"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Key */}
                {unifiAuthMethod === "apikey" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Chave de API (X-API-KEY)</Label>
                    <PasswordInput
                      placeholder="Cole a chave gerada em Settings → Control Plane → Integrations"
                      {...register("unifiApiKey")}
                      className="font-mono text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Gere a chave em: UniFi Network → Settings → Control Plane → Integrations
                    </p>
                  </div>
                )}

                {/* User + Password */}
                {unifiAuthMethod === "userpass" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Usuário</Label>
                      <Input placeholder="admin" {...register("unifiUser")} autoComplete="off" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Senha</Label>
                      <PasswordInput {...register("unifiPass")} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Site</Label>
                    <Input placeholder="default" {...register("unifiSite")} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Porta <span className="text-muted-foreground font-normal">(443 para UniFi OS)</span></Label>
                    <Input
                      type="number"
                      placeholder="443"
                      {...register("unifiPort", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={watch("unifiTlsVerify")}
                    onCheckedChange={(v) => setValue("unifiTlsVerify", v)}
                  />
                  <Label className="text-xs">Verificar certificado TLS</Label>
                </div>

                {/* Modo de conexão */}
                <div className="space-y-2">
                  <Label className="text-xs">Modo de conexão</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["standalone", "controller"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setValue("unifiMode", mode)}
                        className={`text-left px-3 py-2 rounded-lg border text-xs transition-colors ${
                          unifiMode === mode
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-border text-muted-foreground hover:border-muted-foreground"
                        }`}
                      >
                        <p className="font-medium">
                          {mode === "standalone" ? "AP direto / UDM" : "Cloud Key / Controller"}
                        </p>
                        <p className="text-[10px] opacity-70 mt-0.5">
                          {mode === "standalone"
                            ? "O IP do dispositivo é o controlador"
                            : "Controlador em IP separado"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {unifiMode === "controller" && (
                  <div className="space-y-1">
                    <Label className="text-xs">IP do controlador (Cloud Key)</Label>
                    <Input
                      placeholder="192.168.1.10"
                      className="font-mono"
                      {...register("unifiControllerIp")}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      O IP acima identifica cada AP; o controlador é acessado neste endereço.
                    </p>
                  </div>
                )}

                {/* Testar conexão */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={unifiTest.status === "testing"}
                    onClick={testUnifiConnection}
                    className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors"
                  >
                    {unifiTest.status === "testing" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    {unifiTest.status === "testing" ? "Testando..." : "Testar conexão"}
                  </button>
                  {unifiTest.status === "ok" && (
                    <div className="flex items-start gap-2 rounded-md bg-success/10 border border-success/30 px-3 py-2 text-xs text-success">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{unifiTest.message}</span>
                    </div>
                  )}
                  {unifiTest.status === "error" && (
                    <div className="flex items-start gap-2 rounded-md bg-destructive/5 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                      <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{unifiTest.message}</span>
                    </div>
                  )}
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
