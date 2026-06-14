import { resolveRouterosCredentials, resolveUnifiApiKey, resolveUnifiCredentials, resolveOmadaCredentials } from "@/lib/crypto";
import type { Device } from "@prisma/client";

export function sanitizeDevice(device: Device) {
  const {
    routerosUserEnc, routerosPassEnc,
    unifiApiKeyEnc, unifiUserEnc, unifiPassEnc,
    omadaClientIdEnc, omadaClientSecretEnc,
    // SEC-031: never expose SNMP community — neither the encrypted blob nor the
    // legacy plaintext column (older rows still hold a real community there)
    snmpCommunity, snmpCommunityEnc,
    ...rest
  } = device;
  return {
    ...rest,
    hasRouterosCredentials: !!(resolveRouterosCredentials({ routerosUserEnc, routerosPassEnc })),
    hasUnifiApiKey:          !!(resolveUnifiApiKey({ unifiApiKeyEnc })),
    hasUnifiCredentials:     !!(resolveUnifiCredentials({ unifiUserEnc, unifiPassEnc })),
    hasOmadaCredentials:     !!(resolveOmadaCredentials({ omadaClientIdEnc, omadaClientSecretEnc })),
    hasSnmpCredentials:      !!snmpCommunityEnc || (snmpCommunity != null && snmpCommunity !== "public"),
  };
}
