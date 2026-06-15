"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Device } from "@prisma/client";
import { DeviceFormProtocols } from "@/components/device-form-protocols";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  ip: z.string()
    .min(1, "IP é obrigatório")
    .regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato de IP inválido (ex: 192.168.1.1)")
    .refine(ip => ip.split(".").every(o => parseInt(o, 10) <= 255), "Octetos do IP devem estar entre 0 e 255"),
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
  checkInterval:   z.number().min(10).max(3600),
  maintenanceUntil: z.string().optional().nullable(),
  alertWebhookUrl: z.string().url("URL inválida").or(z.literal("")).optional().nullable(),
  alertThreshold:  z.number().int().min(1).max(100),
});

export type FormData = z.infer<typeof schema>;

interface DeviceFormProps {
  device?: Device & { hasUnifiApiKey?: boolean; hasUnifiCredentials?: boolean; hasOmadaCredentials?: boolean };
}

export function DeviceForm({ device }: DeviceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const methods = useForm<FormData>({
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
          snmpCommunity: "", // write-only: API never returns it; blank = manter atual
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
          checkInterval:   device.checkInterval,
          maintenanceUntil: device.maintenanceUntil
            ? new Date(device.maintenanceUntil).toISOString().slice(0, 16)
            : "",
          alertWebhookUrl: device.alertWebhookUrl ?? "",
          alertThreshold:  device.alertThreshold ?? 3,
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
          checkInterval:   60,
          maintenanceUntil: "",
          alertWebhookUrl: "",
          alertThreshold:  3,
        },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  const deviceType = watch("type");

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const url    = device ? `/api/devices/${device.id}` : "/api/devices";
      const method = device ? "PUT" : "POST";

      // UI-only mode field maps to controllerIp (null = standalone)
      const { unifiMode: _uMode, ...rest } = data;
      const payload = {
        ...rest,
        maintenanceUntil: data.maintenanceUntil ? new Date(data.maintenanceUntil).toISOString() : null,
        // "" is not a valid URL for the server schema — send null when no webhook is set
        alertWebhookUrl: data.alertWebhookUrl || null,
        unifiControllerIp:
          data.unifiMode === "controller" && data.unifiControllerIp
            ? data.unifiControllerIp
            : null,
        omadaControllerIp: data.omadaControllerIp || null,
        // Write-only credentials: omit when blank so the API keeps the stored value
        // on edit (sending "" would clear it). On create, omitted = no credential.
        snmpCommunity:     data.snmpCommunity || undefined,
        routerosUser:      data.routerosUser || undefined,
        routerosPass:      data.routerosPass || undefined,
        omadaClientId:     data.omadaClientId || undefined,
        omadaClientSecret: data.omadaClientSecret || undefined,
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
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" {...register("name", { onBlur: () => trigger("name") })} placeholder="Mikrotik Escritório" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ip">Endereço IP *</Label>
                <Input id="ip" {...register("ip", { onBlur: () => trigger("ip") })} placeholder="192.168.1.1" className="font-mono" />
                {errors.ip && <p className="text-xs text-destructive">{errors.ip.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={deviceType}
                  onValueChange={(v) => {
                    setValue("type", v as FormData["type"]);
                    // Disable protocol toggles that don't belong to the new type
                    if (v !== "MIKROTIK") setValue("routerosEnabled", false);
                    if (v !== "UNIFI_AP") setValue("unifiEnabled", false);
                    if (v !== "OMADA_AP") setValue("omadaEnabled", false);
                  }}
                >
                  <SelectTrigger id="type">
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

            <div className="space-y-2">
              <Label htmlFor="alertWebhookUrl">Webhook de alerta (opcional)</Label>
              <Input
                id="alertWebhookUrl"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                {...register("alertWebhookUrl")}
              />
              {errors.alertWebhookUrl && <p className="text-xs text-destructive">{errors.alertWebhookUrl.message}</p>}
              <p className="text-xs text-muted-foreground">URL que recebe um POST JSON quando o dispositivo fica offline por N checks consecutivos.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alertThreshold">Checks falhos antes do alerta</Label>
              <Input
                id="alertThreshold"
                type="number"
                min={1}
                max={100}
                {...register("alertThreshold", { valueAsNumber: true })}
              />
              {errors.alertThreshold && <p className="text-xs text-destructive">{errors.alertThreshold.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenanceUntil">Manutenção programada até</Label>
              <Input
                id="maintenanceUntil"
                type="datetime-local"
                {...register("maintenanceUntil")}
              />
              <p className="text-xs text-muted-foreground">
                Enquanto o horário não expirar, o worker não gera incidentes para este dispositivo.
              </p>
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Protocolos de Monitoramento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DeviceFormProtocols device={device} />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading || isSubmitting}>
            {loading || isSubmitting ? "Salvando..." : device ? "Atualizar" : "Cadastrar"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(device ? `/devices/${device.id}` : "/devices")}
          >
            Cancelar
          </Button>
          {isDirty && !loading && (
            <span className="flex items-center gap-1 text-xs text-warning font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-warning inline-block" />
              Modificado
            </span>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
