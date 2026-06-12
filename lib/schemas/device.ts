import { z } from "zod";

// SEC-030: valida que cada octeto é 0–255
const ipSchema = z
  .string()
  .regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato de IP inválido")
  .refine(
    ip => ip.split(".").every(o => parseInt(o, 10) <= 255),
    "Octetos do IP devem estar entre 0 e 255"
  );

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
  snmpCommunity: z.string().default("public"),
  snmpPort: z.number().int().min(1).max(65535).default(161),
  routerosEnabled: z.boolean().default(false),
  routerosUser: z.string().optional().nullable(),
  routerosPass: z.string().optional().nullable(),
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
  unifiControllerIp: ipSchema.optional().nullable(),
  omadaEnabled:         z.boolean().default(false),
  omadaClientId:        z.string().optional().nullable(),
  omadaClientSecret:    z.string().optional().nullable(),
  omadacId:             z.string().optional().nullable(),
  omadaSite:            z.string().optional().nullable(),
  omadaSiteId:          z.string().optional().nullable(),
  omadaTlsVerify:       z.boolean().default(true),
  omadaControllerIp:    ipSchema.optional().nullable(),
  checkInterval: z.number().int().min(10).max(3600).default(60),
});

export const bulkDeviceSchema = deviceConfigSchema.omit({ ip: true }).extend({
  ipStart: ipSchema,
  ipEnd: ipSchema,
});
