"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import type { Device } from "@prisma/client";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  ip: z.string().min(1, "IP é obrigatório"),
  type: z.enum(["MIKROTIK", "DVR", "CAMERA", "OTHER", "UNIFI_AP", "OMADA_AP"]),
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
  omadaEnabled: z.boolean(),
  omadaClientId:     z.string().optional().nullable(),
  omadaClientSecret: z.string().optional().nullable(),
  omadacId:          z.string().optional().nullable(),
  omadaSite:         z.string().optional().nullable(),
  omadaSiteId:       z.string().optional().nullable(),
  omadaTlsVerify:    z.boolean(),
  omadaControllerIp: z.string().optional().nullable(),
  checkInterval: z.number().min(10).max(3600),
});

type FormData = z.infer<typeof schema>;

interface DeviceFormProps {
  device?: Device & { hasUnifiApiKey?: boolean; hasUnifiCredentials?: boolean; hasOmadaCredentials?: boolean };
}

export function DeviceForm({ device }: DeviceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [unifiTest, setUnifiTest] = useState<{ status: "idle" | "testing" | "ok" | "error"; message?: string; sites?: string[] }>({ status: "idle" });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: device
      ? {
          name: device.name,
          ip: device.ip,
          type: device.type,
          location: device.location ?? "",
          notes: device.notes ?? "",
          pingEnabled: device.pingEnabled,
          httpEnabled: device.httpEnabled,
          httpPort: device.httpPort ?? undefined,
          httpPath: device.httpPath,
          snmpEnabled: device.snmpEnabled,
          snmpCommunity: device.snmpCommunity,
          snmpPort: device.snmpPort,
          routerosEnabled: device.routerosEnabled,
          routerosUser: "",
          routerosPass: "",
          routerosPort: device.routerosPort,
          unifiEnabled: device.unifiEnabled,
          unifiAuthMethod: (device.unifiAuthMethod as "apikey" | "userpass") ?? "apikey",
          unifiApiKey: "",
          unifiUser: "",
          unifiPass: "",
          unifiPort: device.unifiPort,
          unifiSite: device.unifiSite,
          unifiTlsVerify: device.unifiTlsVerify,
          unifiMode: device.unifiControllerIp ? "controller" : "standalone",
          unifiControllerIp: device.unifiControllerIp ?? "",
          omadaEnabled:      device.omadaEnabled,
          omadaClientId:     "",
          omadaClientSecret: "",
          omadacId:          device.omadacId ?? "",
          omadaSite:         device.omadaSite ?? "",
          omadaSiteId:       device.omadaSiteId ?? "",
          omadaTlsVerify:    device.omadaTlsVerify,
          omadaControllerIp: device.omadaControllerIp ?? "",
          checkInterval: device.checkInterval,
        }
      : {
          type: "MIKROTIK",
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
          unifiControllerIp: "",
          omadaEnabled:      false,
          omadaClientId:     "",
          omadaClientSecret: "",
          omadacId:          "",
          omadaSite:         "",
          omadaSiteId:       "",
          omadaTlsVerify:    true,
          omadaControllerIp: "",
          checkInterval: 60,
        },
  });

  const deviceType      = watch("type");
  const httpEnabled     = watch("httpEnabled");
  const snmpEnabled     = watch("snmpEnabled");
  const routerosEnabled = watch("routerosEnabled");
  const unifiEnabled    = watch("unifiEnabled");
  const unifiAuthMethod = watch("unifiAuthMethod");
  const unifiMode       = watch("unifiMode");
  const omadaEnabled    = watch("omadaEnabled");

  const [omadaTest, setOmadaTest] = useState<{ status: "idle" | "testing" | "ok" | "error"; message?: string; sites?: Array<{ siteId: string; name: string }> }>({ status: "idle" });

  async function testUnifiConnection() {
    const values = watch();
    const controllerIp =
      values.unifiMode === "controller" && values.unifiControllerIp
        ? values.unifiControllerIp
        : values.ip;

    if (!controllerIp) {
      setUnifiTest({ status: "error", message: "Informe o IP do dispositivo (ou do controlador)" });
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
          deviceId: device?.id,
        }),
      });
      const json = await res.json() as { ok?: boolean; message?: string; sites?: string[]; error?: string };
      if (res.ok && json.ok) {
        setUnifiTest({ status: "ok", message: json.message, sites: json.sites });
      } else {
        setUnifiTest({ status: "error", message: json.error ?? "Falha no teste" });
      }
    } catch {
      setUnifiTest({ status: "error", message: "Erro de rede ao testar conexão" });
    }
  }

  async function testOmadaConnection() {
    const values = watch();
    const controllerIp = values.omadaControllerIp?.trim() || values.ip;
    const omadacId     = values.omadacId?.trim();

    if (!controllerIp) {
      setOmadaTest({ status: "error", message: "Informe o IP do controlador" });
      return;
    }
    if (!omadacId) {
      setOmadaTest({ status: "error", message: "Informe o Omada Controller ID (omadacId)" });
      return;
    }

    setOmadaTest({ status: "testing" });
    try {
      const res = await fetch("/api/devices/test-omada", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controllerIp,
          omadacId,
          tlsVerify: values.omadaTlsVerify,
          omadaClientId:     values.omadaClientId     || undefined,
          omadaClientSecret: values.omadaClientSecret || undefined,
          deviceId: device?.id,
        }),
      });
      const json = await res.json() as { ok?: boolean; message?: string; sites?: Array<{ siteId: string; name: string }>; error?: string };
      if (res.ok && json.ok) {
        setOmadaTest({ status: "ok", message: json.message, sites: json.sites });
      } else {
        setOmadaTest({ status: "error", message: json.error ?? "Falha no teste" });
      }
    } catch {
      setOmadaTest({ status: "error", message: "Erro de rede ao testar conexão" });
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const url    = device ? `/api/devices/${device.id}` : "/api/devices";
      const method = device ? "PUT" : "POST";

      // UI-only mode field maps to controllerIp (null = standalone)
      const { unifiMode: _uMode, ...rest } = data;
      const payload = {
        ...rest,
        unifiControllerIp:
          data.unifiMode === "controller" && data.unifiControllerIp
            ? data.unifiControllerIp
            : null,
        omadaControllerIp: data.omadaControllerIp || null,
        // Clear unused auth fields so the API can null them in DB
        unifiApiKey: data.unifiAuthMethod === "apikey" ? (data.unifiApiKey || undefined) : "",
        unifiUser:   data.unifiAuthMethod === "userpass" ? (data.unifiUser || undefined) : "",
        unifiPass:   data.unifiAuthMethod === "userpass" ? (data.unifiPass || undefined) : "",
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Falha ao salvar");

      toast.success(device ? "Dispositivo atualizado!" : "Dispositivo cadastrado!");
      router.push("/devices");
      router.refresh();
    } catch {
      toast.error("Erro ao salvar dispositivo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...register("name")} placeholder="Mikrotik Escritório" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip">Endereço IP *</Label>
              <Input id="ip" {...register("ip")} placeholder="192.168.1.1" className="font-mono" />
              {errors.ip && <p className="text-xs text-destructive">{errors.ip.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                defaultValue={device?.type ?? "MIKROTIK"}
                onValueChange={(v) => {
                  setValue("type", v as FormData["type"]);
                  // Disable protocol toggles that don't belong to the new type
                  if (v !== "MIKROTIK") setValue("routerosEnabled", false);
                  if (v !== "UNIFI_AP") setValue("unifiEnabled", false);
                  if (v !== "OMADA_AP") setValue("omadaEnabled", false);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MIKROTIK">Mikrotik</SelectItem>
                  <SelectItem value="UNIFI_AP">UniFi AP</SelectItem>
                  <SelectItem value="OMADA_AP">Omada AP (TP-Link)</SelectItem>
                  <SelectItem value="DVR">DVR</SelectItem>
                  <SelectItem value="CAMERA">Câmera</SelectItem>
                  <SelectItem value="OTHER">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input id="location" {...register("location")} placeholder="Sala de TI" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" {...register("notes")} rows={2} />
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Protocolos de Monitoramento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ICMP Ping */}
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

          {/* HTTP */}
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

          {/* SNMP */}
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

          {/* RouterOS — apenas para Mikrotik */}
          {deviceType === "MIKROTIK" && <div className="space-y-3">
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
          </div>}

          <Separator />

          {/* UniFi — apenas para UniFi AP */}
          {deviceType === "UNIFI_AP" && <div className="space-y-3">
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
                {/* Auth method toggle */}
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
                  <Label className="text-xs">
                    Chave de API (X-API-KEY)
                    {device?.hasUnifiApiKey && (
                      <span className="ml-2 text-muted-foreground font-normal">· chave já configurada</span>
                    )}
                  </Label>
                  <PasswordInput
                    placeholder={device?.hasUnifiApiKey ? "Deixe em branco para manter a chave atual" : "Cole a chave gerada em Settings → Control Plane → Integrations"}
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
                    <Label className="text-xs">
                      Usuário
                      {device?.hasUnifiCredentials && (
                        <span className="ml-2 text-muted-foreground font-normal">· já configurado</span>
                      )}
                    </Label>
                    <Input
                      placeholder={device?.hasUnifiCredentials ? "Deixe em branco para manter" : "admin"}
                      {...register("unifiUser")}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Senha</Label>
                    <PasswordInput
                      placeholder={device?.hasUnifiCredentials ? "Deixe em branco para manter" : ""}
                      {...register("unifiPass")}
                    />
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

                {/* IP do controlador — apenas no modo controller */}
                {unifiMode === "controller" && (
                  <div className="space-y-1">
                    <Label className="text-xs">IP do controlador (Cloud Key)</Label>
                    <Input
                      placeholder="192.168.1.10"
                      className="font-mono"
                      {...register("unifiControllerIp")}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      O IP do dispositivo acima identifica o AP; o controlador é acessado neste endereço.
                    </p>
                  </div>
                )}

                {/* Test connection */}
                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={unifiTest.status === "testing"}
                    onClick={testUnifiConnection}
                    className="gap-2"
                  >
                    {unifiTest.status === "testing" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    {unifiTest.status === "testing" ? "Testando..." : "Testar conexão"}
                  </Button>

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
          </div>}

          <Separator />

          {/* Omada — apenas para Omada AP */}
          {deviceType === "OMADA_AP" && <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Omada Controller API</p>
                <p className="text-xs text-muted-foreground">SSIDs, clientes e métricas de APs TP-Link Omada</p>
              </div>
              <Switch
                checked={omadaEnabled}
                onCheckedChange={(v) => setValue("omadaEnabled", v)}
              />
            </div>
            {omadaEnabled && (
              <div className="space-y-3 pl-4 border-l-2 border-muted">
                {/* OAuth2 Credentials */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Client ID
                      {device?.hasOmadaCredentials && (
                        <span className="ml-2 text-muted-foreground font-normal">· já configurado</span>
                      )}
                    </Label>
                    <Input
                      placeholder={device?.hasOmadaCredentials ? "Deixe em branco para manter" : ""}
                      {...register("omadaClientId")}
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Client Secret</Label>
                    <PasswordInput
                      placeholder={device?.hasOmadaCredentials ? "Deixe em branco para manter" : ""}
                      {...register("omadaClientSecret")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Omada Controller ID</Label>
                    <Input
                      placeholder="a6f5e5d78223de677588121e18273675"
                      className="font-mono text-xs"
                      {...register("omadacId")}
                    />
                    <p className="text-[10px] text-muted-foreground">Identificador do controlador na API</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">IP do Omada Controller</Label>
                    <Input
                      placeholder="10.0.0.19"
                      className="font-mono"
                      {...register("omadaControllerIp")}
                    />
                    <p className="text-[10px] text-muted-foreground">O IP do dispositivo identifica o AP</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={watch("omadaTlsVerify")}
                    onCheckedChange={(v) => setValue("omadaTlsVerify", v)}
                  />
                  <Label className="text-xs">Verificar certificado TLS</Label>
                </div>

                {/* Test connection + site selector */}
                <div className="space-y-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={omadaTest.status === "testing"}
                    onClick={testOmadaConnection}
                    className="gap-2"
                  >
                    {omadaTest.status === "testing" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5" />
                    )}
                    {omadaTest.status === "testing" ? "Testando..." : "Testar conexão"}
                  </Button>

                  {omadaTest.status === "ok" && (
                    <div className="flex items-start gap-2 rounded-md bg-success/10 border border-success/30 px-3 py-2 text-xs text-success">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{omadaTest.message}</span>
                    </div>
                  )}
                  {omadaTest.status === "error" && (
                    <div className="flex items-start gap-2 rounded-md bg-destructive/5 border border-destructive/30 px-3 py-2 text-xs text-destructive">
                      <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{omadaTest.message}</span>
                    </div>
                  )}

                  {omadaTest.status === "ok" && omadaTest.sites && omadaTest.sites.length > 0 && (
                    <div className="space-y-1">
                      <Label className="text-xs">Site</Label>
                      <Select
                        value={watch("omadaSiteId") ?? ""}
                        onValueChange={(v) => {
                          const site = omadaTest.sites?.find((s) => s.siteId === v);
                          setValue("omadaSiteId", v);
                          setValue("omadaSite", site?.name ?? "");
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecione o site" />
                        </SelectTrigger>
                        <SelectContent>
                          {omadaTest.sites.map((s) => (
                            <SelectItem key={s.siteId} value={s.siteId} className="text-xs">
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {watch("omadaSite") && (
                        <p className="text-[10px] text-muted-foreground">
                          Site selecionado: <span className="font-medium">{watch("omadaSite")}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {(!omadaTest.sites || omadaTest.sites.length === 0) && (watch("omadaSite") || watch("omadaSiteId")) && (
                    <div className="space-y-1">
                      <Label className="text-xs">Site configurado</Label>
                      <p className="text-xs text-muted-foreground">
                        {watch("omadaSite")} <span className="opacity-50">({watch("omadaSiteId")})</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : device ? "Atualizar" : "Cadastrar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(device ? `/devices/${device.id}` : "/devices")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
