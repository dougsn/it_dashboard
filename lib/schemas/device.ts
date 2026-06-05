import { z } from "zod";

export const deviceConfigSchema = z.object({
  name: z.string().min(1).max(100),
  ip: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato de IP inválido"),
  type: z.enum(["MIKROTIK", "DVR", "CAMERA", "OTHER"]),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  pingEnabled: z.boolean().default(true),
  httpEnabled: z.boolean().default(false),
  httpPort: z.number().int().min(1).max(65535).optional().nullable(),
  httpPath: z.string().default("/"),
  snmpEnabled: z.boolean().default(false),
  snmpCommunity: z.string().default("public"),
  snmpPort: z.number().int().min(1).max(65535).default(161),
  routerosEnabled: z.boolean().default(false),
  routerosUser: z.string().optional().nullable(),
  routerosPass: z.string().optional().nullable(),
  routerosPort: z.number().int().min(1).max(65535).default(8728),
  checkInterval: z.number().int().min(10).max(3600).default(60),
});

export const bulkDeviceSchema = deviceConfigSchema.omit({ ip: true }).extend({
  ipStart: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato de IP inválido"),
  ipEnd: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Formato de IP inválido"),
});
