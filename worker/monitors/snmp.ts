import * as snmp from "net-snmp";
import { log } from "../../lib/logger";

export interface SnmpResult {
  cpuLoad: number | null;
  memoryUsed: number | null;
  uptime: number | null;
}

const OID_CPU_LOAD = "1.3.6.1.2.1.25.3.3.1.2.1";
const OID_SYSUPTIME = "1.3.6.1.2.1.1.3.0";
const OID_STORAGE_USED = "1.3.6.1.2.1.25.2.3.1.6.65536";
const OID_STORAGE_SIZE = "1.3.6.1.2.1.25.2.3.1.5.65536";
const OID_CONTROLID_CPU = "1.3.6.1.4.1.49617.1.1.5.0";

function getOids(
  session: snmp.Session,
  oids: string[]
): Promise<Map<string, number>> {
  return new Promise((resolve, reject) => {
    const results = new Map<string, number>();
    session.get(oids, (error, varbinds) => {
      // A request-level error (timeout, no response) means the device is unreachable
      // via SNMP — surface it instead of silently returning an empty result set.
      if (error) return reject(error);
      if (varbinds) {
        for (const vb of varbinds) {
          if (!snmp.isVarbindError(vb)) {
            // Some devices (like Control iD) return OCTET STRING like "15%".
            // parseFloat(String(vb.value)) correctly extracts the number.
            results.set(vb.oid, parseFloat(String(vb.value)));
          }
        }
      }
      resolve(results);
    });
  });
}

async function tryGetSnmp(ip: string, community: string, port: number, version: snmp.Version): Promise<SnmpResult> {
  const session = snmp.createSession(ip, community, {
    port,
    timeout: 3000,
    retries: 1,
    version,
  });

  try {
    let values: Map<string, number>;
    try {
      values = await getOids(session, [
        OID_CPU_LOAD,
        OID_SYSUPTIME,
        OID_STORAGE_USED,
        OID_STORAGE_SIZE,
      ]);
    } catch (err: any) {
      // If it's a timeout, throw it so the caller can fallback from v2c to v1
      if (err && err.message && err.message.includes("Request timed out")) {
        throw err;
      }
      
      // In SNMPv1, if ANY requested OID is unsupported, the whole request fails with noSuchName.
      // Many embedded devices (like airOS) don't support HOST-RESOURCES-MIB.
      // Let's fallback to asking ONLY for sysUpTime.
      log("info", `[SNMP] Full request failed for ${ip} (${err.message}), retrying with sysUpTime only...`);
      values = await getOids(session, [OID_SYSUPTIME]);
    }

    const uptimeTicks = values.get(OID_SYSUPTIME);
    const uptime = uptimeTicks != null && !isNaN(uptimeTicks) ? Math.floor(uptimeTicks / 100) : null;

    let cpuLoad = values.get(OID_CPU_LOAD) ?? null;
    if (cpuLoad != null && isNaN(cpuLoad)) cpuLoad = null;

    // Fallback for Control iD devices that use a proprietary OID for CPU usage
    if (cpuLoad === null) {
      try {
        const cidValues = await getOids(session, [OID_CONTROLID_CPU]);
        const cidCpu = cidValues.get(OID_CONTROLID_CPU);
        if (cidCpu != null && !isNaN(cidCpu)) {
          // Control iD exports CPU as a fixed-point number (e.g. 85693 for 85.693%)
          // similar to cpuTemperature which is T * 1000.
          cpuLoad = cidCpu > 100 ? cidCpu / 1000 : cidCpu;
        }
      } catch (e) {
        // Ignore errors (like noSuchName) for devices that are not Control iD
      }
    }

    const storageUsed = values.get(OID_STORAGE_USED);
    const storageSize = values.get(OID_STORAGE_SIZE);
    const memoryUsed =
      storageUsed != null && storageSize != null && storageSize > 0 && !isNaN(storageUsed) && !isNaN(storageSize)
        ? (storageUsed / storageSize) * 100
        : null;

    return { cpuLoad, memoryUsed, uptime };
  } finally {
    session.close();
  }
}

export async function checkSnmp(
  ip: string,
  community: string = "public",
  port: number = 161
): Promise<SnmpResult> {
  try {
    // Attempt SNMPv2c first
    return await tryGetSnmp(ip, community, port, snmp.Version2c);
  } catch (err: any) {
    // If v2c times out, the device might only support v1 (common in DVRs and older cameras)
    if (err && err.message && err.message.includes("Request timed out")) {
      try {
        log("info", `[SNMP] v2c timed out for ${ip}, trying v1 fallback...`);
        return await tryGetSnmp(ip, community, port, snmp.Version1);
      } catch (fallbackErr) {
        log("warn", "[SNMP] consulta falhou (v1 fallback)", { ip, error: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr) });
        return { cpuLoad: null, memoryUsed: null, uptime: null };
      }
    }
    
    // For other errors, just log and return nulls
    log("warn", "[SNMP] consulta falhou", { ip, error: err instanceof Error ? err.message : String(err) });
    return { cpuLoad: null, memoryUsed: null, uptime: null };
  }
}
