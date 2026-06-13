import { resolveRouterosCredentials, resolveUnifiApiKey, resolveUnifiCredentials, resolveOmadaCredentials } from "@/lib/crypto";
import type { Device } from "@prisma/client";

export function sanitizeDevice(device: Device) {
  const {
    routerosUserEnc, routerosPassEnc,
    unifiApiKeyEnc, unifiUserEnc, unifiPassEnc,
    omadaClientIdEnc, omadaClientSecretEnc,
    ...rest
  } = device;
  return {
    ...rest,
    hasRouterosCredentials: !!(resolveRouterosCredentials({ routerosUserEnc, routerosPassEnc })),
    hasUnifiApiKey:          !!(resolveUnifiApiKey({ unifiApiKeyEnc })),
    hasUnifiCredentials:     !!(resolveUnifiCredentials({ unifiUserEnc, unifiPassEnc })),
    hasOmadaCredentials:     !!(resolveOmadaCredentials({ omadaClientIdEnc, omadaClientSecretEnc })),
  };
}
