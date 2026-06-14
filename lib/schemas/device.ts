import { z } from "zod";

// SEC-030: valida que cada octeto é 0–255
const ipSchema = z
  .string()
  .regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato de IP inválido")
  .refine(
    ip => ip.split(".").every(o => parseInt(o, 10) <= 255),
    "Octetos do IP devem estar entre 0 e 255"
  );

// SEC-025: rejeita IPs especiais que podem ser usados para SSRF
// Permitido: endereços RFC 1918 privados (10.x, 172.16-31.x, 192.168.x) — controladores locais legítimos
// Bloqueado: loopback (127.x), link-local (169.254.x — inclui metadata AWS), não-especificado (0.0.0.0),
//            broadcast (255.255.255.255) e multicast (224.x–239.x)
function rejectSsrfRanges(ip: string): boolean {
  const octets = ip.split(".").map(o => parseInt(o, 10));
  const [a, b] = octets;
  if (a === 127) return false;                    // loopback
  if (a === 169 && b === 254) return false;       // link-local / AWS metadata
  if (a === 0) return false;                      // 0.0.0.0 não-especificado
  if (a === 255) return false;                    // broadcast
  if (a >= 224 && a <= 239) return false;         // multicast
  return true;
}

export const controllerIpSchema = z
  .string()
  .min(1, "IP do controlador é obrigatório")
  .regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato de IP inválido")
  .refine(ip => ip.split(".").every(o => parseInt(o, 10) <= 255), "Octetos inválidos")
  .refine(rejectSsrfRanges, "IP não permitido: endereços de loopback, link-local e multicast são rejeitados");

export const deviceConfigSchema = z.object({
  name: z.string().min(1).max(100),
  ip: ipSchema,
  type: z.enum(["MIKROTIK", "DVR", "CAMERA", "OTHER", "UNIFI_AP", "OMADA_AP"]),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  pingEnabled: z.boolean().default(true),
  httpEnabled: z.boolean().default(false),
  httpPort: z.number().int().min(1).max(65535).optional().nullable(),
  // SEC-025: path deve começar com / e não conter ..
  httpPath: z
    .string()
    .startsWith("/", "O caminho deve começar com /")
    .refine(p => !p.includes(".."), "O caminho não pode conter ..")
    .default("/"),
  snmpEnabled: z.boolean().default(false),
  // Write-only credential: omitted on edit means "keep stored value". Encrypted to
  // snmpCommunityEnc on create/update; resolveSnmpCommunity falls back to "public".
  snmpCommunity: z.string().optional(),
  snmpPort: z.number().int().min(1).max(65535).default(161),
  routerosEnabled: z.boolean().default(false),
  routerosUser: z.string().optional().nullable(), // input only — never persisted, always encrypted to routerosUserEnc
  routerosPass: z.string().optional().nullable(), // input only — never persisted, always encrypted to routerosPassEnc
  routerosPort: z.number().int().min(1).max(65535).default(8728),
  unifiEnabled: z.boolean().default(false),
  unifiAuthMethod: z.enum(["apikey", "userpass"]).default("apikey"),
  unifiApiKey: z.string().optional().nullable(),
  unifiUser: z.string().optional().nullable(),
  unifiPass: z.string().optional().nullable(),
  unifiPort: z.number().int().min(1).max(65535).default(443),
  unifiSite: z.string().default("default"),
  // SEC-023: TLS verificado por padrão — desabilitar é inseguro e deve ser explícito
  unifiTlsVerify: z.boolean().default(true),
  unifiControllerIp: controllerIpSchema.optional().nullable(),
  omadaEnabled:         z.boolean().default(false),
  omadaClientId:        z.string().optional().nullable(),
  omadaClientSecret:    z.string().optional().nullable(),
  omadacId:             z.string().optional().nullable(),
  omadaSite:            z.string().optional().nullable(),
  omadaSiteId:          z.string().optional().nullable(),
  omadaTlsVerify:       z.boolean().default(true),
  omadaControllerIp:    controllerIpSchema.optional().nullable(),
  checkInterval: z.number().int().min(10).max(3600).default(60),
  maintenanceUntil: z.string().datetime({ offset: true }).optional().nullable(),
  alertWebhookUrl: z.string().url("URL inválida").optional().nullable(),
  alertThreshold:  z.number().int().min(1).max(100).default(3),
});

export const bulkDeviceSchema = deviceConfigSchema.omit({ ip: true }).extend({
  ipStart: ipSchema,
  ipEnd: ipSchema,
});
