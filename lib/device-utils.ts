import { resolveRouterosCredentials, resolveUnifiApiKey, resolveUnifiCredentials } from "@/lib/crypto";
import type { Device } from "@prisma/client";

export function sanitizeDevice(device: Device) {
  const {
    routerosUser, routerosPass, routerosUserEnc, routerosPassEnc,
    unifiApiKeyEnc, unifiUserEnc, unifiPassEnc,
    ...rest
  } = device;
  return {
    ...rest,
    hasRouterosCredentials: !!(resolveRouterosCredentials({ routerosUser, routerosPass, routerosUserEnc, routerosPassEnc })),
    hasUnifiApiKey:          !!(resolveUnifiApiKey({ unifiApiKeyEnc })),
    hasUnifiCredentials:     !!(resolveUnifiCredentials({ unifiUserEnc, unifiPassEnc })),
  };
}
